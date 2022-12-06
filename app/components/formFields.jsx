import { useRef, useState, useEffect } from "react";
// import { useMediaQuery } from "usehooks-ts";

function useMediaQuery(mediaQueryString) {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryString);

    const listener = () => setMatches(!!mediaQueryList.matches);
    mediaQueryList.addListener(listener);

    // Call the listener() function immediately to set the local
    // state as soon as possible.
    listener();

    return () => {
      mediaQueryList.removeListener(listener);
    };
  }, [mediaQueryString]);

  return matches;
}

export default function FormFields(props) {
  function expensiveFunction(key) {
    const value = {
      "true-items": props.viewedInvoice && props.viewedInvoice.items,
      "false-items": [{ name: "", quantity: "", price: 0, total: 0 }],
      "true-date": new Date(props.date),
      "false-date": new Date(),
    };
    return props.viewedInvoice ? value[`true-${key}`] : value[`false-${key}`];
  }

  const [items, setItems] = useState(() => expensiveFunction("items"));
  const [date, setDate] = useState(() => expensiveFunction("date"));
  const invoiceDateEl = useRef(null);
  const dateRectEl = useRef(null);
  const termsRectEl = useRef(null);
  const paymentTermsEl = useRef(null);
  const isNotMobile = useMediaQuery("(min-width: 768px)");

  function handleNewItem() {
    setItems([...items, { name: "", quantity: "", price: 0, total: 0 }]);
    console.log(items);
  }

  function handleDelete(e) {
    const index = e.target.dataset.index;
    const array = Array.from(items);
    array.splice(index, 1);
    setItems(array);
  }

  function handleNextDate(e) {
    const step = e.currentTarget.dataset.step;
    invoiceDateEl.current.focus();
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth() + Number(step)
    );
    setDate(newDate);
  }

  function handleDateChange(e) {
    const value = e.currentTarget.value;
    const newDate = new Date(value);
    !!newDate.getDate() && setDate(newDate);
    // console.log(newDate);
  }

  function handleFocus(e) {
    const focused = e.currentTarget.dataset.focused;
    focused === "date" && dateRectEl.current.classList.add("date-rect-focus");
    focused === "terms" &&
      termsRectEl.current.classList.add("terms-rect-focus");
  }

  function handleSetDate(e) {
    const day = e.currentTarget.dataset.day;
    const monthString = date.toDateString().split(" ")[1];
    invoiceDateEl.current.value = `${
      day < 10 ? "0" + day : day
    } ${monthString} ${date.getFullYear()}`;
    dateRectEl.current.classList.remove("date-rect-focus");

    // const newDate = new Date(day, date.getMonth(), date.getFullYear());
    // setDate(newDate);
    // console.log(invoiceDateEl.current);
  }

  function handleTermSelect(e) {
    const value = e.currentTarget.textContent;
    paymentTermsEl.current.value = value;
    termsRectEl.current.classList.remove("terms-rect-focus");
  }

  const month = date.getMonth();
  const monthString = date.toDateString().split(" ")[1];
  const year = date.getFullYear();
  const days = new Date(year, month + 1, 0).getDate();
  let weekday = new Date(year, month, 1).getDay();
  if (weekday === 0) weekday = 7;
  const calender = Array.from(Array(days + weekday - 1)).map((el, i) => {
    return i + 1 < weekday ? " " : i - weekday + 2;
  });

  return (
    <div className="form-field">
      <div className="bill-from">
        <p className="bill-head">Bill From</p>
        <div className="strt-addr form-section">
          <label htmlFor="street-address">Street Address</label>
          <input
            type="text"
            id="street-address"
            name="sender-street"
            defaultValue={
              props.viewedInvoice && props.viewedInvoice.senderAddress.street
            }
            required
          />
        </div>
        <div className="city-postal-country form-section">
          <div className="city">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="sender-city"
              name="sender-city"
              defaultValue={
                props.viewedInvoice && props.viewedInvoice.senderAddress.city
              }
              required
            />
          </div>
          <div className="postal">
            <label htmlFor="postal-code">postal code</label>
            <input
              type="text"
              id="sender-postal-code"
              name="sender-postal-code"
              defaultValue={
                props.viewedInvoice &&
                props.viewedInvoice.senderAddress.postCode
              }
            />
          </div>
          <div className="country">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="sender-country"
              defaultValue={
                props.viewedInvoice && props.viewedInvoice.senderAddress.country
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="bill-to">
        <p className="bill-head">Bill To</p>
        <div className="clnt-nme form-section">
          <label htmlFor="client-name ">Client's name</label>
          <p className="err-msg hide">can’t be empty</p>
          <input
            type="text"
            id="client-name"
            name="client-name"
            defaultValue={props.viewedInvoice && props.viewedInvoice.clientName}
            required
          />
        </div>
        <div className="cln-eml form-section">
          <label htmlFor="client-email">Client Email</label>
          <input
            type="email"
            id="client-email"
            name="client-email"
            defaultValue={
              props.viewedInvoice && props.viewedInvoice.clientEmail
            }
          />
        </div>
        <div className="strt-addr form-section">
          <label htmlFor="street-address">Street Address</label>
          <input
            type="text"
            id="client-street"
            name="client-street"
            defaultValue={
              props.viewedInvoice && props.viewedInvoice.clientAddress.street
            }
          />
        </div>
        <div className="city-postal-country form-section">
          <div className="city">
            <label htmlFor="city">City</label>
            <input
              type="text"
              name="client-city"
              id="city"
              defaultValue={
                props.viewedInvoice && props.viewedInvoice.clientAddress.city
              }
            />
          </div>

          <div className="postal">
            <label htmlFor="postal-code">postal code</label>
            <input
              type="text"
              name="client-postal-code"
              id="postal-code"
              defaultValue={
                props.viewedInvoice &&
                props.viewedInvoice.clientAddress.postCode
              }
            />
          </div>
          <div className="country">
            <label htmlFor="country">country</label>
            <input
              type="text"
              name="client-country"
              id="country"
              defaultValue={
                props.viewedInvoice && props.viewedInvoice.clientAddress.country
              }
            />
          </div>
        </div>

        <div className="invoice-date-terms form-section">
          <div className="invoice-date">
            <label htmlFor="invoice-date">Invoice date</label>
            <input
              type="text"
              name="created-at"
              id="invoice-date"
              data-focused="date"
              defaultValue={`${
                props.invoiceDateArr
                  ? `${props.invoiceDateArr[2]} ${props.invoiceDateArr[1]} ${props.invoiceDateArr[3]}`
                  : ""
              }`}
              required
              className="date-input"
              onChange={handleDateChange}
              onFocus={handleFocus}
              ref={invoiceDateEl}
            />
            <div className="date-rect" ref={dateRectEl}>
              <div className="controls">
                <div
                  className="left-arrow"
                  onClick={handleNextDate}
                  data-step={-1}
                ></div>
                <div className="month-year">
                  <span className="month">{monthString} </span>
                  <span className="year">{year}</span>
                </div>
                <div
                  className="right-arrow"
                  onClick={handleNextDate}
                  data-step={1}
                ></div>
              </div>
              <div className="dates">
                {calender.map((day, i) => (
                  <div
                    key={i}
                    className="date-nos"
                    onClick={handleSetDate}
                    data-day={day}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="payment-terms">
            <label htmlFor="payment-terms">Payment terms</label>
            <input
              type="text"
              name="payment-terms"
              id="payment-terms"
              data-focused="terms"
              defaultValue={"Net 30 Days"}
              className="select-input"
              onFocus={handleFocus}
              ref={paymentTermsEl}
              required
            />
            <div className="terms-rect" ref={termsRectEl}>
              <div className="net-days">
                <p onClick={handleTermSelect}>Net 1 day</p>
              </div>
              <div className="net-days">
                <p onClick={handleTermSelect}>Net 7 days</p>
              </div>
              <div className="net-days">
                <p onClick={handleTermSelect}>Net 14 days</p>
              </div>
              <div className="net-days">
                <p onClick={handleTermSelect}>Net 30 days</p>
              </div>
            </div>
          </div>
        </div>
        {/* <select name="payment-terms" id="payment-terms">
              <option defaultValue="Net 1 Day">Net 1 Day</option>
              <option defaultValue=">Net 7 Days">Net 7 Days</option>
              <option defaultValue="Net 14 Days">Net 14 Days</option>
              <option defaultValue="Net 30 Days">Net 30 Days</option>
            </select> */}
        <div className="project-desc form-section">
          <label htmlFor="project-desc">Project description</label>
          <input
            type="text"
            id="project-desc"
            name="description"
            defaultValue={
              props.viewedInvoice && props.viewedInvoice.description
            }
            required
          />
        </div>
      </div>

      {isNotMobile && (
        <div className="item-list lg-view">
          {/* <p>{items[1].name && "Welp"}</p> */}
          <p>Item list</p>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty.</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="prod-name">
                    <input
                      type="text"
                      name="item-name"
                      id=""
                      defaultValue={item.name}
                      required
                    />
                  </td>
                  <td className="qty">
                    <input
                      type="number"
                      name="item-quantity"
                      id=""
                      defaultValue={item.quantity}
                      required
                      min={1}
                    />
                  </td>
                  <td className="price">
                    <input
                      type="number"
                      name="item-price"
                      id=""
                      step="any"
                      defaultValue={item.price.toFixed(2)}
                      required
                    />
                  </td>
                  <td className="total-txt">
                    <div className="txt-del">
                      <div className="txt">{item.total.toFixed(2)}</div>
                      <div
                        className="del-icon"
                        onClick={handleDelete}
                        data-index={i}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="add-new" onClick={handleNewItem}>
            + Add New Item
          </button>
        </div>
      )}
      {!isNotMobile && (
        <div className="item-list sm-view">
          <p className="item-head">Item list </p>
          {items.map((item, i) => (
            <div className="item" key={i}>
              <div className="item-name">
                <label htmlFor="item-name">Item Name</label>
                <input
                  type="text"
                  name="item-name"
                  id="item-name"
                  defaultValue={item.name}
                />
              </div>
              <table>
                <thead>
                  <tr>
                    <th>
                      <label htmlFor="qty">Qty.</label>
                    </th>
                    <th>
                      <label htmlFor="price">Price</label>
                    </th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        type="number"
                        name={"item-quantity"}
                        id="qty"
                        defaultValue={item.quantity}
                        className="qty-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="item-price"
                        id="price"
                        step="any"
                        defaultValue={item.price.toFixed(2)}
                        className="price-input"
                      />
                    </td>
                    <td className="total-txt">
                      <div className="txt-del">
                        <div className="txt">{item.total.toFixed(2)}</div>
                        <div
                          className="del-icon"
                          onClick={handleDelete}
                          data-index={i}
                        ></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <button type="button" className="add-new" onClick={handleNewItem}>
            + Add New Item
          </button>
        </div>
      )}
    </div>
  );
}
