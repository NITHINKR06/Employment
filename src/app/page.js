import Link from "next/link";
// import Payment from "@/authentication/Payment";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Name */}
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      
      {/* Navigation Link */}
      <nav>
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link 
              href="/auth/login" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </Link>
          </li>
          <li>
            <Link 
              href="/auth/signup" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Signup
            </Link>
          </li>
          <li>
            <Link 
              href="/auth/resetpassword" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset Password
            </Link>
          </li>
          <li>
            <Link 
              href="/contacts" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Contacts
            </Link>
          </li>
          <li>
            <Link 
              href="/about" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              About
            </Link>
          </li>
          {/* <li>
            <Link 
              href="/payment" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Payment
            </Link>
          </li> */}
        </ul>
      </nav>

      {/* If you want to render the Payment component on this page, remove the comment */}
      {/* <Payment /> */}
    </div>
  );
}
