const TOKEN = 'patpwdpJLQBm15v3V.8e7639cc74382ba24d602c8036074c18c4e672a189ffb5437e061ccb49125b78';
const BASE = 'appq0ev1rvBz2jLAy';
const CONV = 'tblHBMLHsz6XBKmyZ';
const STOCK = 'tblYKh6qPeuuhbxVB';
const ORDERS = 'tblNBHONiupSnyX2g';
const DELIVERY = 'tblNBHONiupSnyX2g';
const H = {'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'};
const ICOLORS = {PRICE:'#5A4FCF',ORDER:'#B23D22',CUSTOMIZATION:'#9C3558',DELIVERY:'#197280',AVAILABILITY:'#208754',SUPPORT:'#C5221F'};
const CATICONS = {Cake:'🎂',Cupcake:'🧁',Brownie:'🍫',Cookie:'🍪',Snack:'🥐',GENERAL:'📦'};
const WHATSAPP_WEBHOOK = 'https://rithwikreddy.app.n8n.cloud/webhook/send-whatsapp';
const INGREDIENTS = [
  {name:'Flour',usedIn:'Sourdough, Croissant',status:'In Stock'},
  {name:'Butter',usedIn:'Croissant, Cakes',status:'Low Stock'},
  {name:'Sugar',usedIn:'Pastries, Cakes',status:'In Stock'},
  {name:'Eggs',usedIn:'Pastries, Cakes',status:'In Stock'},
  {name:'Cocoa Powder',usedIn:'Forest Gateau, Brownies',status:'In Stock'},
  {name:'Cream Cheese',usedIn:'Cheesecake',status:'Low Stock'},
  {name:'Vanilla Extract',usedIn:'Cakes',status:'In Stock'},
  {name:'Baking Powder',usedIn:'Cakes, Pastries',status:'In Stock'},
  {name:'Whipping Cream',usedIn:'Cakes, Pastries',status:'In Stock'},
  {name:'Dark Chocolate',usedIn:'Truffle Cake, Brownies',status:'Low Stock'}
];

const ORDER_STATUS_COLORS = {Received:'#4285F4',Confirmed:'#FB8C00',Baking:'#F59E0B','Out for Delivery':'#197280',Delivered:'#208754',Cancelled:'#EA4335'};
const PAYMENT_COLORS = {Pending:'#FB8C00',Paid:'#208754',Refunded:'#EA4335'};
const DELIVERY_STATUS_COLORS = {Scheduled:'#4285F4','Out for Delivery':'#FB8C00',Delivered:'#208754',Failed:'#EA4335'};

// Global state
let cachedConvs = [], cachedStocks = [], cachedOrders = [], cachedDeliveries = [];
let platformChartI = null, intentChartI = null, sentimentChartI = null;
let leadScoreChartI = null, volumeChartI = null;
let allMsgs = [], dispCount = 10, msgFilter = 'all';
let allCusts = [], currentSideView = 'orders';
