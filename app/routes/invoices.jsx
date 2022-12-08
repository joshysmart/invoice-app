import { db } from "~/utils/db.server";
import id from "~/utils/id_gen";
import { redirect, json } from "@remix-run/node";
import { Outlet, useActionData, useOutletContext } from "@remix-run/react";
import { getUser } from "~/utils/sessions.server";

const validateItems = (items) => {
  if (items.length < 1) {
    return ["- All fields must be added", "- An item must be added"];
  }
};

const validateDate = (date) => {
  console.log(typeof date);
  if (!date.getDate()) {
    return "Date must be a valid string";
  }
};

function badRequest(data) {
  return json(data, { status: 400 });
}

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const user = await getUser(request);

  const netDays = Number(formData.get("payment-terms").split(" ")[1]);
  const payDate = new Date(formData.get("created-at"));
  const year = payDate.getFullYear();
  const month = payDate.getMonth();
  const day = payDate.getDate();

  const dueDate = new Date(year, month, day + netDays);
  const dueYear = dueDate.getFullYear();
  const dueMonth = dueDate.getMonth();
  const dueDay = dueDate.getDate();

  const itemsArr = [];
  const itemName = formData.getAll("item-name");
  const itemQuantity = formData.getAll("item-quantity");
  const itemPrice = formData.getAll("item-price");

  const action = formData.get("_action");
  const status = action.includes("Draft") ? "draft" : "pending";

  for (let i = 0; i < itemName.length; i++) {
    const items = {};
    items["name"] = itemName[i];
    items["quantity"] = Number(itemQuantity[i]);
    items["price"] = Number(itemPrice[i]);
    items["total"] = Number(itemPrice[i]) * Number(itemQuantity[i]);
    itemsArr.push(items);
  }
  // itemsArr.push
  // const total = itemsArr.reduce(
  //   (accumulator, currentValue) => accumulator["total"]
  // );

  const total = itemsArr.map((el) => el.total).reduce((a, b) => a + b, 0);

  const fields = { itemsArr, payDate };

  const fieldErrors = {
    itemsArr: validateItems(itemsArr),
    date: validateDate(payDate),
  };
  console.log(fieldErrors);

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  console.log("itemName");
  console.log(fieldErrors);

  if (user) {
    try {
      await db.invoice.create({
        data: {
          invoiceId: id,
          userId: user.id,
          createdAt: `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
            day < 10 ? `0${day}` : day
          }`,
          paymentDue: `${dueYear}-${
            dueMonth + 1 < 10 ? `0${dueMonth + 1}` : dueMonth + 1
          }-${dueDay < 10 ? `0${dueDay}` : dueDay}`,
          description: formData.get("description"),
          paymentTerms: netDays,
          clientName: formData.get("client-name"),
          clientEmail: formData.get("client-email"),
          status: status,
          senderAddress: {
            street: formData.get("sender-street"),
            city: formData.get("sender-city"),
            postCode: formData.get("sender-postal-code"),
            country: formData.get("sender-country"),
          },
          clientAddress: {
            street: formData.get("client-street"),
            city: formData.get("client-city"),
            postCode: formData.get("client-postal-code"),
            country: formData.get("client-postal-country"),
          },
          items: itemsArr,
          total: total,
        },
      });
    } catch (error) {
      console.log(error);
    }
    return redirect(request.url);
  }
  return redirect("/auth/login");
};

export default function Invoices() {
  const actionData = useActionData();
  const wrapperEL = useOutletContext();
  const success = !actionData?.fieldErrors;

  return <Outlet context={{ wrapperEL, actionData, success }} />;
}
