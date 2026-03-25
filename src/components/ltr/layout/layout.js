import Footer from "./footer";

import Header from "./header";




export default function Layout({ children, hideMiddleHeader = false, globalSettings, initialHeaderData = null }) {
  return (
   <>
  <Header hideMiddleHeader={hideMiddleHeader} globalSettings={globalSettings} initialHeaderData={initialHeaderData} />
       {children}
      <Footer hideMiddleHeader={hideMiddleHeader}/>
   </>

  );
}