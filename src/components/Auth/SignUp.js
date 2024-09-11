import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const navigate = useNavigate();

  const handleOnSignUp = () => {
    // Navigate to the desired page after sign-up
    navigate('/');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Create Your Account</h1>
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        onSignUp={handleOnSignUp}
      />
    </main>
  );
}
