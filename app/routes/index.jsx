import { redirect } from "@remix-run/node";
import { getUser } from "~/utils/sessions.server";

export const loader = async ({ request }) => {
  const user = await getUser(request);

  if (user) return redirect("/invoices");
  return "";
};

export default function Index() {
  return (
    <aside className="right-section">
      <div className={`header `}>
        <div className="invoices-heading">
          <h1 className="">Invoices</h1>
          <p>
            <span className="">No invoices</span>
          </p>
        </div>
        <button className="sign-up">
          <a href="/auth/login" className="">
            Sign up
          </a>
        </button>
      </div>

      <div className="invoices-wrapper">
        <div className="empty-illustration"></div>
        <div className="empty-text">
          <h3>There is nothing here</h3>
          <p className="create-inv ">
            Create an invoice by clicking the <b>Sign up</b> button and get
            started
          </p>
        </div>
      </div>
    </aside>
  );
}
