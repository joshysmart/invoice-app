import {
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { db } from "~/utils/db.server";
import FormFields from "../../../components/formFields";
import { useRef } from "react";
import { redirect, json } from "@remix-run/node";

const validateName = (clientName) => {
  if (typeof clientName !== "string" || clientName.length < 3) {
    return "can’t be empty";
  }
};

const validateItems = (items) => {
  if (items.length < 1) {
    return ["- All fields must be added", "- An item must be added"];
  }
};

const validateDate = (date) => {
  // console.log(typeof date);
  if (!date.getDate()) {
    return "Date must be a valid string";
  }
};

function badRequest(data) {
  return json(data, { status: 400 });
}

export const loader = async ({ request, params }) => {
  const data = {
    invoice: await db.invoice.findMany({
      where: {
        id: {
          equals: `${params.viewid}`,
        },
      },
    }),
  };
  return data;
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  console.log("action", action);

  switch (action) {
    case "PAID":
      await db.invoice.update({
        where: {
          id: params.viewid,
        },
        data: {
          status: "paid",
        },
      });
      break;
    case "DELETE":
      try {
        await db.invoice.delete({
          where: {
            id: params.viewid,
          },
        });
        return redirect(`/invoices`);
      } catch (error) {
        console.log(error);
      }
      break;

    default:
      const clientName = formData.get("client-name");
      const netDays = Number(formData.get("payment-terms")?.split(" ")[1]);
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

      for (let i = 0; i < itemName.length; i++) {
        const items = {};
        items["name"] = itemName[i];
        items["quantity"] = Number(itemQuantity[i]);
        items["price"] = Number(itemPrice[i]);
        items["total"] = Number(itemPrice[i]) * Number(itemQuantity[i]);
        itemsArr.push(items);
      }

      const total = itemsArr.map((el) => el.total).reduce((a, b) => a + b, 0);
      const fields = { clientName, itemsArr, payDate };

      const fieldErrors = {
        clientName: validateName(clientName),
        itemsArr: validateItems(itemsArr),
        date: validateDate(payDate),
      };

      // console.log(fieldErrors);

      if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields });
      }

      await db.invoice.update({
        where: {
          id: params.viewid,
        },
        data: {
          createdAt: `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
            day < 10 ? `0${day}` : day
          }`,
          paymentDue: `${dueYear}-${
            dueMonth + 1 < 10 ? `0${dueMonth + 1}` : dueMonth + 1
          }-${dueDay < 10 ? `0${dueDay}` : dueDay}`,
          description: formData.get("description"),
          paymentTerms: netDays,
          clientName: clientName,
          clientEmail: formData.get("client-email"),
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

      break;
  }
  // for (const [k, v] of formData) {
  //   console.log(k, v);
  // }
  // const createInvoice = await db.invoice.create({
  // data: formData.entries(),
  // });
  // console.log("form", formData.entries());
  return redirect(`/invoices/view/${params.viewid}`);
};

export default function View() {
  const { invoice } = useLoaderData();
  const actionData = useActionData();
  const success = !actionData?.fieldErrors;
  // actionData?.fieldErrors && setSuccess(!success);
  // actionData.FormFieldas

  // const navigate = useNavigate();
  const { wrapperEL } = useOutletContext();
  const deleteModal = useRef(null);
  const editInvoiceFormEl = useRef(null);
  const viewedInvoiceEl = useRef(null);
  const goBackEL = useRef(null);
  const routeBackEl = useRef(null);
  const overlayEl = useRef(null);

  const viewedInvoice = invoice[0];
  const invoiceDateArr = new Date(viewedInvoice?.createdAt)
    .toDateString()
    .split(" ");
  const dueDateArr = new Date(viewedInvoice?.paymentDue)
    .toDateString()
    .split(" ");

  function handleDelete(e) {
    wrapperEL.current.classList.toggle("modal-open");
    deleteModal.current.classList.toggle("open");
    console.log("i don tire");
  }

  function handleEdit(e) {
    // e.preventDefault();
    editInvoiceFormEl.current.classList.toggle("hide");
    viewedInvoiceEl.current.classList.toggle("hide-for-mobile");
    overlayEl.current.classList.toggle("open-overlay");
    goBackEL.current.classList.toggle("hide");
    routeBackEl.current.classList.toggle("hide");

    console.log("i don tire");
  }

  return (
    <div className="right-section" id="invoice">
      <div className={`go-back go-back-sm ${success && "hide"}`} ref={goBackEL}>
        <button onClick={handleEdit}>Go back</button>
      </div>

      <div className={`go-back ${!success && "hide"}`} ref={routeBackEl}>
        <button>
          <a href="/invoices">Go back</a>
        </button>
      </div>

      <div
        className={`view-grid ${!success && "hide-for-mobile"}`}
        ref={viewedInvoiceEl}
      >
        <div className="view-heading">
          <div className="status">
            <p className="status-text">Status</p>
            <div className={`status-rect ${viewedInvoice?.status}-rect`}>
              <div className={`circle ${viewedInvoice?.status}-circle`}></div>
              <p className={`invoice-status ${viewedInvoice?.status}-text`}>
                {viewedInvoice?.status}
              </p>
            </div>
          </div>
        </div>

        <div className="view-controls">
          <div className="edit">
            <button onClick={handleEdit}>Edit</button>
          </div>
          <div className="delete">
            <button onClick={handleDelete}>Delete</button>
          </div>
          <div className="mark-paid">
            <form action="" method="post">
              <input className="hide" name="_action" defaultValue={"PAID"} />
              <button>Mark as Paid</button>
            </form>
          </div>
        </div>

        <div className="view-invoice-desc">
          <div className="invoice-item">
            <div className="invoice-id">
              <p>
                <span className="hash">#</span>
                <span className="bold">{viewedInvoice?.invoiceId}</span>
              </p>
              <p>{viewedInvoice?.description}</p>
            </div>

            <div className="invoice-address">
              <p>{viewedInvoice?.senderAddress.street}</p>
              <p className="city">{viewedInvoice?.senderAddress.city}</p>
              <p className="post">{viewedInvoice?.senderAddress.postCode}</p>
              <p>{viewedInvoice?.senderAddress.country}</p>
            </div>
          </div>

          <div className="invoice-desc">
            <div className="invoice-dates">
              <div className="inv-date">
                <p>Invoice Date</p>
                <p className="bold">
                  {invoiceDateArr[2]} {invoiceDateArr[1]} {invoiceDateArr[3]}
                </p>
              </div>
              <div className="payment-date">
                <p>Payment Due</p>
                <p className="bold">
                  {dueDateArr[2]} {dueDateArr[1]} {dueDateArr[3]}
                </p>
              </div>
            </div>

            <div className="bill-info">
              <p>Bill to</p>
              <p className="bold">{viewedInvoice?.clientName}</p>
              <div className="billing-address">
                <p>{viewedInvoice?.clientAddress.street}</p>
                <p>{viewedInvoice?.clientAddress.city}</p>
                <p>{viewedInvoice?.clientAddress.postCode}</p>
                <p>{viewedInvoice?.clientAddress.country}</p>
              </div>
            </div>

            <div className="sent-to">
              <p>Sent to</p>
              <p className="bold">{viewedInvoice?.clientEmail}</p>
            </div>
          </div>

          <div className="item-table">
            <table className="invoice-table">
              <thead>
                <tr className="lg-view-tr">
                  <th>Item Name</th>
                  <th>QTY.</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {viewedInvoice?.items.map((item) => (
                  <tr key={item.name}>
                    <td className="bold">
                      {item.name}
                      <p className="sm-view">
                        {item.quantity} x £ {item.price}
                      </p>
                    </td>
                    <td className="lg-view-td">{item.quantity}</td>
                    <td className="lg-view-td">£ {item.price.toFixed(2)}</td>
                    <td className="bold">£ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <span className="lg-view">Amount Due</span>
                    <span className="sm-view">Grand Total</span>
                  </td>
                  <td colSpan={3}>£ {viewedInvoice?.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div className={`overlay ${!success && "open-overlay"}`} ref={overlayEl}>
        <div
          className={`edit-invioce ${success && "hide"}`}
          ref={editInvoiceFormEl}
        >
          <p className="form-head-text">
            <span className="bold">Edit</span> #
            <span className="bold">{viewedInvoice?.invoiceId}</span>
          </p>
          <form method="post">
            <input className="hide" name="_action" defaultValue={"EDIT"} />
            <FormFields
              viewedInvoice={viewedInvoice}
              invoiceDateArr={invoiceDateArr}
              date={viewedInvoice?.createdAt}
            />
            <div className="error">
              {actionData?.fieldErrors.itemsArr &&
                actionData?.fieldErrors.itemsArr.map((el, i) => (
                  <p className="error-msg" key={i}>
                    {el}
                  </p>
                ))}
            </div>
            <div className="buttons-rect">
              <div className="gradient-rect"></div>
              <div className="buttons">
                <button className="cancel" onClick={handleEdit}>
                  <a href="#invoice">Cancel</a>
                </button>
                <button className="submit">Save channges</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="deletion-modal" ref={deleteModal}>
        <div className="my-modal-wrapper">
          <h3 className="confirm-text">Confirm Deletion</h3>
          <p className="warn-text">
            Are you sure you want to delete invoice #{viewedInvoice?.invoiceId}?
            This action cannot be undone.
          </p>
          <div className="del-buttons">
            <button className="cancel" onClick={handleDelete}>
              Cancel
            </button>
            <form action="" method="post">
              <input className="hide" name="_action" defaultValue={"DELETE"} />
              <button className="delete">Delete</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
