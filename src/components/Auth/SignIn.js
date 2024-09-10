import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Sign In to Your Account</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <SignIn path="/signin" routing="path" signUpUrl="/signup" />
      </div>
    </main>
  );
}
