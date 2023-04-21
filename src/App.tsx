import axios from "axios";
import { useState } from "react";
import { AuthResult, PaymentDTO, User } from "./types";
import Header from "./components/Headers";
import SignIn from "./components/SignIn";

import "./App.css";
import ItemCard from "./components/ItemCard";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const axiosClient = axios.create({
  baseURL: `${backendURL}`,
  timeout: 20000,
  withCredentials: true,
});
const config = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const signIn = async () => {
    const scopes = ["username", "payments"];
    const authResult: AuthResult = await window.Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    );
    signInUser(authResult);
    setUser(authResult.user);
  };

  const signOut = () => {
    setUser(null);
    signOutUser();
  };
  const signInUser = (authResult: AuthResult) => {
    axiosClient.post("/user/signin", { authResult });
    return setShowModal(false);
  };

  const signOutUser = () => {
    return axiosClient.get("/user/signout");
  };

  const orderItem = async (memo: string, amount: number, paymentMetadata: {}) => {
    if(user === null) {
      return setShowModal(true);
    }
    const paymentData = { amount, memo, metadata: paymentMetadata };
    const callbacks = {
      onReadyForServerApproval,
      onReadyForServerCompletion,
      onCancel,
      onError
    };
    const payment = await window.Pi.createPayment(paymentData, callbacks);
    console.log(payment);
  }

  const onModalClose = () => {
    setShowModal(false);
  };

  const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
    return axiosClient.post("/payments/incomplete", { payment });
  };

  const onReadyForServerApproval = (paymentId: string) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post("/payments/approve", { paymentId }, config);
  };

  const onReadyForServerCompletion = (paymentId: string, txid: string) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    axiosClient.post("/payments/complete", { paymentId, txid }, config);
  };

  const onCancel = (paymentId: string) => {
    console.log("onCancel", paymentId);
    return axiosClient.post("/payments/cancelled_payment", { paymentId });
  };

  const onError = (error: Error, payment?: PaymentDTO) => {
    console.log("onError", error);
    if (payment) {
      console.log(payment);
      // handle the error accordingly
    }
  };

  return (
    <>
      <Header user={user} onSignIn={signIn} onSignOut={signOut} />

      <h1>Welcome to NFT Market</h1>
      <ItemCard
        name="Anup Jain "
        description="Anup jain song. Anup jain song. Anup jain song. Anup jain song."
        price={1}
        pictureURL="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Apple_pie.jpg/1280px-Apple_pie.jpg"
        pictureCaption="Picture by Dan Parsons"
        onClickBuy={()=>orderItem("Order Anup Jain", 1, { productId: 'anup_jain_101' })}
      
      />
      {showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} />}
    </>
  );
}

export default App;