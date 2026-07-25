"use client";

import { useState } from "react";
import { SlidingCard } from "@/components/common/sliding-card";
import { HomePanel } from "./home-panel";
import { LoginPanel } from "./login-panel";
import { SignupPanel } from "./signup-panel";

type View = "home" | "login" | "signup";
type AuthMode = "login" | "signup";

const viewConfigs = {
  home: { width: 475, height: 350 },
  login: { width: 420, height: 460 },
  signup: { width: 420, height: 490 },
} as const;

export function HeroCard() {
  const [view, setView] = useState<View>("home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Physical slots are only "home" and "auth"
  const slidingView = view === "home" ? "home" : "auth";

  const authConfig =
    authMode === "signup" ? viewConfigs.signup : viewConfigs.login;

  const goToLogin = () => {
    setAuthMode("login");
    setView("login");
  };

  const goToSignup = () => {
    setAuthMode("signup");
    setView("signup");
  };

  const goHome = () => {
    setView("home");
    // DO NOT change authMode
    // The outgoing must panel keep the correct content while fading out
  };

  return (
    <SlidingCard
      view={slidingView}
      configs={{
        home: viewConfigs.home,
        auth: authConfig,
      }}
      order={["home", "auth"]}
      gap={32}
      panels={{
        home: <HomePanel onLogin={goToLogin} onRegister={goToSignup} />,
        auth:
          authMode === "signup" ? (
            <SignupPanel onBack={goHome} />
          ) : (
            <LoginPanel onBack={goHome} />
          ),
      }}
    />
  );
}
