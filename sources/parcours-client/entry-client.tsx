import { hydrateRoot } from "react-dom/client";
import Storefront from "./app/storefront";
import OrderStatus from "./app/order-status";
import "./app/catalogue-reel.css";
const root=document.getElementById("mirlipousse-root")!;
hydrateRoot(root,root.dataset.view==="order"?<OrderStatus/>:<Storefront/>);

import "./app/reviews-style.css";

import "./app/commerce.css";

import "./app/ages.css";

import "./app/brand.css";
import "./app/interaction-chic.css";
