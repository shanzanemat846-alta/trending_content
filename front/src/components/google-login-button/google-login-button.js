'use client'

import Image from "next/image"

export default function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri =  process.env.NEXT_PUBLIC_RE_DIRECT_URL; // Dummy redirect URI
    const scope = "openid email profile";
    const responseType = "code";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    console.log('googleAuthUrl: ', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        borderRadius: '8px',
        border: '1px solid black',
        backgroundColor: 'white',
        padding: '10px 20px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        width: '100%',
        maxWidth: '400px'
      }}
      type="button"
    >
      <Image
        src="/logo/google.svg"
        alt="Google logo"
        width={20}
        height={20}
      />
      Sign in with Google
    </button>
  )
};
