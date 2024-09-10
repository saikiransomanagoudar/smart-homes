import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();

  const handleOnSignIn = () => {
    // Navigate to the desired page after sign-in
    navigate('/');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Sign In to Your Account</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <SignIn
          path="/signin"
          routing="path"
          signUpUrl="/signup"
          onSignIn={handleOnSignIn}
        />
      </div>
    </main>
  );
}
