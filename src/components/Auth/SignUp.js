import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Create Your Account</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <SignUp path="/signup" routing="path" signInUrl="/signin" />
      </div>
    </main>
  );
}
