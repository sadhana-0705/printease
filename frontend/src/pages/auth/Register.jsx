import RegisterForm from "../../components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-[70vh] py-8 bg-gradient-to-br from-[#ffe5b4] to-[#ffcc80]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent-800 mb-2">Join Printease</h1>
          <p className="text-neutral-600">Create your account to get started</p>
        </div>
        <div className="page-container">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
