/* eslint-disable react/jsx-no-undef */
import React, { useState } from "react";
import { Youtube, Instagram, Check } from "lucide-react";

const ConnectSocials = () => {
  const [connected, setConnected] = useState({
    youtube: false,
    instagram: false,
  });

  const handleConnect = (platform) => {
    if (platform === "instagram") {
      const authUrl =
        `https://www.instagram.com/oauth/authorize?` +
        `enable_fb_login=0&` +
        `force_authentication=1&` +
        `client_id=${process.env.REACT_APP_META_APP_ID}&` +
        `redirect_uri=${process.env.REACT_APP_META_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;

      window.location.href = authUrl;
    } else if (platform === "youtube") {
      window.location.href = "https://oauth-p4jc.onrender.com/auth/google";
    }
    
    setConnected((prev) => ({ ...prev, [platform]: true }));
  };

  const handleNext = () => {
    alert("Proceeding to the next step...");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto mt-12">
      <div className="text-center mb-4">
        <p className="text-gray-600">
          Connect your social media accounts so we can analyze your content.
        </p>
      </div>

      <div className="space-y-4">
        {/* YouTube Card */}
        <div className="border rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <Youtube size={24} />
            </div>
            <div>
              <h3 className="font-medium">YouTube</h3>
              <p className="text-sm text-gray-500">Connect your channel</p>
            </div>
          </div>

          {connected.youtube ? (
            <div className="flex items-center text-green-600 gap-2">
              <Check size={20} />
              <span className="font-medium">Connected</span>
            </div>
          ) : (
            <button onClick={() => handleConnect("youtube")}>Connect</button>
          )}
        </div>

        {/* Instagram Card */}
        <div className="border rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
              <Instagram size={24} />
            </div>
            <div>
              <h3 className="font-medium">Instagram</h3>
              <p className="text-sm text-gray-500">Connect your profile</p>
            </div>
          </div>

          {connected.instagram ? (
            <div className="flex items-center text-green-600 gap-2">
              <Check size={20} />
              <span className="font-medium">Connected</span>
            </div>
          ) : (
            <button onClick={() => handleConnect("instagram")}>Connect</button>
          )}
        </div>
      </div>

      <button
        className="w-full btn-gradient"
        onClick={handleNext}
        disabled={!connected.youtube && !connected.instagram}
      >
        {connected.youtube || connected.instagram
          ? "Continue"
          : "Connect at least one account"}
      </button>
    </div>
  );
};

export default ConnectSocials;
