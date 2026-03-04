import Footer from "./footer";

import Header from "./header";




export default function Layout({ children, hideMiddleHeader = false, globalSettings }) {
  return (
   <>
      <Header hideMiddleHeader={hideMiddleHeader} globalSettings={globalSettings}/>
       {children}
      <Footer hideMiddleHeader={hideMiddleHeader}/>
   </>

  );
}