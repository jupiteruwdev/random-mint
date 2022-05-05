import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import { UseWalletProvider } from "use-wallet";

function MyApp({ Component, pageProps }) {
  return (
    <UseWalletProvider chainId={80001}>
      <Component {...pageProps} />
    </UseWalletProvider>
  );
}

export default MyApp;
