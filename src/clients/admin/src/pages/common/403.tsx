import { useNavigate } from 'react-router-dom';
import { useIdentityStore } from '@/stores/identity';

export default function Unauthorize() {
  const navigate = useNavigate();
  const { logout } = useIdentityStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-800">403</h1>
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this resource.
          </p>
          {/* {user && (
            <p className="text-sm text-gray-500">
              Current role: <span className="font-semibold">{user.role}</span>
            </p>
          )} */}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
