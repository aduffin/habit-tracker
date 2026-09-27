import AuthForm from '../components/AuthForm.jsx'

export default function Login({ user }) {
  return <AuthForm mode="login" user={user} />
}