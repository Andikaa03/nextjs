"use client";

import StickyBox from "react-sticky-box";

const ClientStickyBox = ({ children, ...props }) => {
  return <StickyBox {...props}>{children}</StickyBox>;
};

export default ClientStickyBox;
