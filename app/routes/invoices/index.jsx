import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { db } from "~/utils/db.server";
import FormFields from "../../components/formFields";
import { useRef, useState } from "react";
import { redirect } from "@remix-run/node";
import { getUser } from "~/utils/sessions.server";

export const loader = async ({ request }) => {
  const user = await getUser(request);

  // const data = {
  //   invoices: [],
  // };
  if (user) {
    try {
      const data = {
        invoices: await db.invoice.findMany({
          select: {
            id: true,
            invoiceId: true,
            paymentDue: true,
            clientName: true,
            total: true,
            status: true,
          },
          where: {
            userId: user.id,
          },
          orderBy: { createdAt: "desc" },
        }),
      };
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  return redirect("/auth/login");
  // return "";
};

export default function Index() {
  const data = useLoaderData();
  const { actionData, success } = useOutletContext();

  // const { invoices } = useLoaderData();
  const [invoices, setInvoices] = useState(data.invoices);
  // const navigate = useNavigate();
  const addInvoiceFormEl = useRef(null);
  const invoiceWrapperEl = useRef(null);
  const goBackEL = useRef(null);
  const headerEl = useRef(null);
  const overlayEl = useRef(null);
  const statRectEl = useRef(null);

  function handleFilter(e) {
    e.currentTarget.classList.toggle("flip-arrow");
    statRectEl.current.classList.toggle("stat-rect-clicked");
  }

  function handleNewInvoice() {
    addInvoiceFormEl.current.classList.toggle("hide");
    invoiceWrapperEl.current.classList.toggle("hide-for-mobile");
    overlayEl.current.classList.toggle("open-overlay");
    goBackEL.current.classList.toggle("hide");
    headerEl.current.classList.toggle("hide-for-mobile");
  }

  function handleChange(e) {
    const { value } = e.currentTarget;
    const newInvoices = data.invoices.filter(
      (invoice, i) => invoice.status === value
    );

    newInvoices?.length ? setInvoices(newInvoices) : setInvoices(data.invoices);
    // setInvoices(newInvoices);
    // !newInvoices.length && setInvoices(data.invoices);
    console.log(e.currentTarget.checked);
  }

  const invoice = invoices?.map(function (invoice) {
    const dateArr = new Date(invoice.paymentDue).toDateString().split(" ");
    return (
      <Link to={`./view/${invoice.id}`} key={invoice.id}>
        <div className="invoice">
          <div className="id-name">
            <p className="invoice-id">
              <span className="hash">#</span>
              <span className="bold">{invoice.invoiceId}</span>
            </p>
            <p className="sm-view">{invoice.clientName}</p>
            <p className="lg-view">
              Due {dateArr[2]} {dateArr[1]} {dateArr[3]}
            </p>
          </div>
          <div className="date-total-status">
            <div className="date-total">
              <p className="sm-view">
                Due {dateArr[2]} {dateArr[1]} {dateArr[3]}
              </p>
              <p className="lg-view">{invoice.clientName} </p>
              <p className="invoice-amount">
                <span className="bold">
                  £{" "}
                  {invoice.total
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </p>
            </div>
            <div className={`status-rect ${invoice.status}-rect`}>
              <div className={`circle ${invoice.status}-circle`}></div>
              <p className={`invoice-status ${invoice.status}-text`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <aside className="right-section">
      {/* <p>{`${success}`}</p> */}

      {/* <p>{invoicess[0].status}</p> */}
      <div
        className={`go-back sm-view go-back-sm ${success && "hide"}`}
        ref={goBackEL}
      >
        <button onClick={handleNewInvoice}>Go back</button>
      </div>

      <div className={`header ${!success && "hide-for-mobile"}`} ref={headerEl}>
        <div className="invoices-heading">
          <h1 className="">Invoices</h1>
          {invoices?.length ? (
            <p>
              <span className="sm-view">{invoices?.length} invoices</span>
              <span className="lg-view">
                There are {invoices?.length} total invoices
              </span>
            </p>
          ) : (
            <p>No invoices</p>
          )}
        </div>
        <div className="invoice-controls">
          <div className="filter-rect">
            <button className="filter" onClick={handleFilter}>
              <span className="lg-view">
                Filter by status <span className="arrow-up"></span>
              </span>
              <span className="sm-view">Filter</span>
            </button>
            <div className="stat-rect" ref={statRectEl}>
              <div className="checkbox">
                <input
                  type="radio"
                  name="status"
                  id="all"
                  value={"all"}
                  onChange={handleChange}
                />
                <label htmlFor="all">
                  <span className="checked-status">All</span>
                </label>
              </div>
              <div className="checkbox">
                <input
                  type="radio"
                  name="status"
                  id="draft"
                  value={"draft"}
                  onChange={handleChange}
                />
                <label htmlFor="draft">
                  <span className="checked-status">Draft</span>
                </label>
              </div>
              <div className="checkbox">
                <input
                  type="radio"
                  name="status"
                  id="pending"
                  value={"pending"}
                  onChange={handleChange}
                />
                <label htmlFor="pending">
                  <span className="checked-status">Pending</span>{" "}
                </label>
              </div>
              <div className="checkbox">
                <input
                  type="radio"
                  name="status"
                  id="paid"
                  value={"paid"}
                  onChange={handleChange}
                />
                <label htmlFor="paid">
                  <span className="checked-status">Paid</span>
                </label>
              </div>
            </div>
          </div>
          <div className="add-new-rect">
            <button className="add-new" onClick={handleNewInvoice}>
              <span className="add"></span>
              <span className="lg-view">New Invoice</span>
              <span className="sm-view">New</span>
            </button>
          </div>
        </div>
      </div>
      {invoices?.length ? (
        <div
          className={`invoices-wrapper ${!success && "hide-for-mobile"}`}
          ref={invoiceWrapperEl}
        >
          {invoice}
        </div>
      ) : (
        <div
          className={`invoices-wrapper ${!success && "hide-for-mobile"}`}
          ref={invoiceWrapperEl}
        >
          <div className="empty-illustration"></div>
          <div className="empty-text">
            <h3>There is nothing here</h3>
            <p className="create-inv sm-view">
              Create an invoice by clicking the <b>New</b> button and get
              started
            </p>
            <p className="create-inv lg-view">
              Create a new invoice by clicking the <b>New</b> Invoice button and
              get started
            </p>
          </div>
        </div>
      )}

      <div className={`overlay ${!success && "open-overlay"}`} ref={overlayEl}>
        <div
          className={`add-invioce ${success && "hide"}`}
          ref={addInvoiceFormEl}
        >
          <p className="form-head-text">
            <span className="bold">New Invoice</span>
          </p>
          <form method="post">
            <FormFields />
            <div className="error">
              {actionData?.fieldErrors.itemsArr &&
                actionData?.fieldErrors.itemsArr?.map((el, i) => (
                  <p className="error-msg" key={i}>
                    {el}
                  </p>
                ))}
            </div>
            <div className="buttons-rect">
              <div className="gradient-rect"></div>
              <div className="buttons add-invoice-btns">
                <button className="discard">
                  <a href="/invoices">Discard</a>
                </button>
                <input
                  type="submit"
                  className="save"
                  defaultValue={"Save as Draft"}
                  name="_action"
                />
                <input
                  type="submit"
                  className="send"
                  defaultValue={"Save & Send"}
                  name="_action"
                />
                {/* <button className="save" name="_action">
                  Save as Draft
                </button> */}
                {/* <button className="send" name="_action">
                  Save & Send
                </button> */}
              </div>
            </div>
          </form>
          <div className="error hide">
            <p className="error-msg">- All fields must be added</p>
            <p className="error-msg">- An item must be added</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
