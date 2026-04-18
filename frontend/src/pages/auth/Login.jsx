import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-[70vh] py-8 bg-gradient-to-br from-[#e0ffff] to-[#f0ffff]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-800 mb-2">Welcome Back</h1>
          <p className="text-neutral-600">Sign in to your Printease account</p>
        </div>
        <div className="page-container">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
