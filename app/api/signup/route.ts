import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper to generate referral codes like Y1N-4831
function generateInviteCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Y1N-${num}`;
}

export async function POST(req: Request) {
  try {
    const { fullName, phone, email, birthday, inviteCode } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Convert birthday to Date if provided
    const birthdayDate = birthday ? new Date(birthday) : null;

    // --- 1) Find customer (include inviteCode ALWAYS) ---
    let customer = await prisma.customer.findUnique({
      where: { phone },
      include: { inviteCode: true },
    });

    let isNewCustomer = false;

    // --- 2) Create customer if missing ---
    if (!customer) {
      await prisma.customer.create({
        data: {
          fullName,
          phone,
          email,
          birthday: birthdayDate,
          totalPoints: 0,
        },
      });

      isNewCustomer = true;

      // re-fetch with include so types match
      customer = await prisma.customer.findUnique({
        where: { phone },
        include: { inviteCode: true },
      });
    } else {
      // update missing info
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fullName: fullName || customer.fullName,
          email: email || customer.email,
          birthday: birthdayDate || customer.birthday,
        },
      });

      // re-fetch to refresh updated fields
      customer = await prisma.customer.findUnique({
        where: { phone },
        include: { inviteCode: true },
      });
    }

    // --- 3) Apply sign-up bonus +20 ONCE ONLY ---
    let signupBonusApplied = false;

    if (isNewCustomer) {
      await prisma.customer.update({
        where: { id: customer!.id },
        data: { totalPoints: { increment: 20 } },
      });
      signupBonusApplied = true;
    }

    // --- 4) Handle referral code ---
    let inviterBonusApplied = false;

    if (inviteCode && inviteCode.trim() !== "") {
      const inviter = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
        include: { customer: true },
      });

      if (inviter && inviter.customerId !== customer!.id) {
        if (inviter.uses < inviter.maxUses) {
          // give inviter +20 points
          await prisma.customer.update({
            where: { id: inviter.customerId },
            data: { totalPoints: { increment: 20 } },
          });

          inviterBonusApplied = true;

          // update code usage
          await prisma.inviteCode.update({
            where: { code: inviteCode },
            data: { uses: { increment: 1 } },
          });

          // save inviter on customer record
          await prisma.customer.update({
            where: { id: customer!.id },
            data: { invitedById: inviter.customerId },
          });
        }
      }
    }

    // --- 5) Ensure customer has their own referral code ---
    if (!customer!.inviteCode) {
      await prisma.inviteCode.create({
        data: {
          code: generateInviteCode(),
          customerId: customer!.id,
        },
      });
    }

    // --- 6) Fetch final updated customer with inviteCode ---
    const finalCustomer = await prisma.customer.findUnique({
      where: { phone },
      include: { inviteCode: true },
    });

    return NextResponse.json({
      success: true,
      customer: finalCustomer,
      signupBonusApplied,
      inviterBonusApplied,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
