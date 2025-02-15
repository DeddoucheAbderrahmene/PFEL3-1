"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "../components/Header";  // Assurez-vous que ces chemins sont corrects
import Footer from "../components/Footer";

export default function AuthPage() {
  const router = useRouter();

  // États généraux
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Champs communs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Champs pour l'inscription
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSwitchForm = () => {
    setIsLogin((prev) => !prev);
    setForgotPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
    // Réinitialisation des champs
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setNationality("");
    setAddress("");
    setPhoneNumber("");
    setAcceptTerms(false);
  };

  const handleForgotPasswordBack = () => {
    setForgotPassword(false);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail(""); // Réinitialiser l'email également
    setPassword("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Vérification commune
    if (!email || !password) {
      setErrorMsg("Veuillez fournir un email et un mot de passe.");
      return;
    }

    if (forgotPassword) {
      // Réinitialisation du mot de passe
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset", // Assurez-vous d'avoir une page /reset
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Un email de réinitialisation a été envoyé.");
      }
      return;
    }


    if (isLogin) {
        // Connexion
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setErrorMsg(signInError.message);
          return; // Important: Arrêter l'exécution si la connexion échoue.
        }
          // Si signInWithPassword réussit, l'utilisateur est connecté, donc on peut récupérer son ID
          if (signInData && signInData.user) {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role") // Sélectionner uniquement le rôle
                .eq("user_id", signInData.user.id) // Utiliser l'ID de l'utilisateur connecté
                .single(); // S'assurer qu'on récupère un seul utilisateur.

            if (userError) {
              setErrorMsg("Erreur lors de la récupération du rôle de l'utilisateur.");
              return;
            }

          if (userData && userData.role === "hotel_admin") {
                router.push("/AdminH"); // Redirection vers la page AdminH
            } else {
                router.push("/"); // Redirection vers la page d'accueil par défaut
            }
        }

      } else {
        // Inscription : Vérifier les champs requis
        if (!firstName || !lastName) {
          setErrorMsg("Veuillez fournir votre prénom et votre nom.");
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg("Les mots de passe ne correspondent pas.");
          return;
        }
        if (!acceptTerms) {
          setErrorMsg("Vous devez accepter les termes et conditions.");
          return;
        }

        // Inscription avec Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              birth_date: birthDate,
              nationality,
              address,
              phone_number: phoneNumber,
              role: "visitor", // Par défaut, le rôle est "visitor"
            },
          },
        });

        if (signUpError) {
          setErrorMsg(signUpError.message);
        } else {
          setSuccessMsg("Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.");
        }
    }
  };


  // Fonction pour la connexion Google
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      setErrorMsg(error.message);
    }
  };

    // Styles Tailwind pour le formulaire  (Ces styles n'ont pas été modifiés)
    const buttonStyle = "relative inline-flex w-full h-12 active:scale-95 transition-all duration-300 overflow-hidden rounded-lg p-[1px] focus:outline-none";
    const innerButtonStyle = (isSelected) =>
      `inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-sm font-medium backdrop-blur-3xl transition-all duration-200 ${isSelected
        ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
      }`;
    const inputStyle = "mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500";
    const switchButtonStyle = (isSelected) =>
      `inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all duration-300 border ${isSelected
        ? "bg-gray-600 text-white border-amber-100 h-12"
        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border-gray-700 h-11"
      }`;
    const googleButtonStyle = "relative inline-flex w-full h-12 active:scale-95 transition-all duration-300 overflow-hidden rounded-lg p-[1px] focus:outline-none";
    const innerGoogleButtonStyle = "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white backdrop-blur-3xl gap-2 transition-all duration-200 group-hover:bg-[linear-gradient(#e2e2e2,#fefefe)] group-hover:text-blue-600";
  

    return (
      <div className="relative min-h-screen bg-gray-300">
        <Header />
        <main className="flex items-center justify-center min-h-screen m-8 relative z-10">
          <div className="max-w-md w-full mx-auto relative overflow-hidden z-10 bg-gray-800 p-8 rounded-lg shadow-md before:w-24 before:h-24 before:absolute before:bg-purple-600 before:rounded-full before:-z-10 before:blur-2xl after:w-32 after:h-32 after:absolute after:bg-sky-400 after:rounded-full after:-z-10 after:blur-xl after:top-24 after:-right-12">
            <div className="flex justify-between mb-6 space-x-2">
              <button onClick={() => { setIsLogin(true); setForgotPassword(false); }} className={switchButtonStyle(isLogin)}>
                Connexion
              </button>
              <button onClick={() => { setIsLogin(false); setForgotPassword(false); }} className={switchButtonStyle(!isLogin)}>
                Inscription
              </button>
            </div>
  
            <div className="flex justify-center gap-2 mb-4 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
  
            {/* Popup de succès */}
            {successMsg && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#232531] rounded-lg shadow-lg p-6 w-72 sm:w-80">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">Succès</p>
                    <button onClick={() => setSuccessMsg("")} className="text-gray-400 hover:text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-100 text-sm">{successMsg}</p>
                </div>
              </div>
            )}
  
            {/* Popup d'erreur */}
            {errorMsg && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#232531] rounded-lg shadow-lg p-6 w-72 sm:w-80">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold">Erreur</p>
                    <button onClick={() => setErrorMsg("")} className="text-gray-400 hover:text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-100 text-sm">{errorMsg || "Une erreur est survenue. Veuillez réessayer."}</p>
                </div>
              </div>
            )}
  
            <form className="space-y-4" onSubmit={handleSubmit}>
              {forgotPassword ? (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={inputStyle}
                      placeholder="Entrez votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <button type="submit" className={buttonStyle}>
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e7029a,#f472b6,#bd5fff)]"></span>
                      <span className={innerButtonStyle(true)}>Réinitialiser le mot de passe</span>
                    </button>
                  </div>
                  <div className="text-center mt-4">
                    <button type="button" onClick={handleForgotPasswordBack} className="text-teal-500 hover:text-teal-600 focus:outline-none transition-all duration-300">
                      Retour à la connexion
                    </button>
                  </div>
                </>
              ) : isLogin ? (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={inputStyle}
                      placeholder="Entrez votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={inputStyle}
                      placeholder="Entrez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <button type="submit" className={buttonStyle}>
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e7029a,#f472b6,#bd5fff)]"></span>
                      <span className={innerButtonStyle(true)}>Se connecter</span>
                    </button>
                  </div>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setForgotPassword(true)} className="text-teal-500 hover:text-teal-600 focus:outline-none transition-all duration-300">
                      Mot de passe oublié ?
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Formulaire d'inscription */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={inputStyle}
                      placeholder="Entrez votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className={inputStyle}
                      placeholder="Entrez votre prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className={inputStyle}
                      placeholder="Entrez votre nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      className={inputStyle}
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  <div>
                      <label htmlFor="nationality" className="block text-sm font-medium text-gray-300">
                        Nationalité
                      </label>
                      <select
                        id="nationality"
                        className={inputStyle}
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                      >
                        <option value="">Sélectionnez votre nationalité</option>
                        <option value="fr">Français</option>
                        <option value="us">Américain</option>
                        <option value="uk">Britannique</option>
                        <option value="de">Allemand</option>
                        {/* Ajoutez d'autres options si nécessaire */}
                      </select>
                    </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      className={inputStyle}
                      placeholder="Entrez votre adresse"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className={inputStyle}
                      placeholder="Entrez votre numéro de téléphone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={inputStyle}
                      placeholder="Entrez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className={inputStyle}
                      placeholder="Confirmez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="acceptTerms" className="mr-2" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                      J'accepte les termes et conditions
                    </label>
                  </div>
                  <div>
                    <button type="submit" className={buttonStyle}>
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e7029a,#f472b6,#bd5fff)]"></span>
                      <span className={innerButtonStyle(true)}>S'inscrire</span>
                    </button>
                  </div>
                </>
              )}
            </form>
  
            {/* Bouton Google */}
            <div className="mt-6">
              <button onClick={handleGoogleSignIn} className={googleButtonStyle}>
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4285F4,#34A853,#FBBC05,#EA4335,#4285F4)]"></span>
                <span className={innerGoogleButtonStyle}>
                  Se connecter avec{" "}
                  <span className="inline-flex">
                    <span style={{ color: '#4285F4' }}>G</span>
                    <span style={{ color: '#DB4437' }}>o</span>
                    <span style={{ color: '#F4B400' }}>o</span>
                    <span style={{ color: '#4285F4' }}>g</span>
                    <span style={{ color: '#0F9D58' }}>l</span>
                    <span style={{ color: '#DB4437' }}>e</span>
                  </span>
                </span>
              </button>
            </div>
  
            <div className="text-center mt-4">
              <button type="button" onClick={handleSwitchForm} className="text-teal-500 hover:text-teal-600 focus:outline-none transition-all duration-300">
                {isLogin ? "Vous n'avez pas de compte ? Inscrivez-vous" : "Vous avez déjà un compte ? Connectez-vous"}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
}