using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using System.IO;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialExpStoreController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MaterialExpStoreController> _stringLocalizer;
        private readonly IStringLocalizer<CustomerController> _customerLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;
        public MaterialExpStoreController(EIMDBContext context, IStringLocalizer<MaterialExpStoreController> stringLocalizer, IStringLocalizer<CustomerController> customerLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment,
            IRepositoryService repositoryService)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _customerLocalizer = customerLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
        }
        //{
        //    _context = context;
        //    _hostingEnvironment = hostingEnvironment;
        //}
        public class JTableModelMaterialStoreExpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string CusCode { get; set; }
            public string StoreCode { get; set; }
            public string UserExport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Reason { get; set; }

        }
        public IActionResult Index()
        {
            return View();
        }

        [NonAction]
        public JsonResult JTable([FromBody]JTableModelMaterialStoreExpGoodsHeaders jTablePara, int userType = 0)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode, jTablePara.UserExport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.Reason);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.QrTicketCode = CommonUtil.GenerateQRCode(item.TicketCode);
                //}

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserExport", "UserExportName", "UserReceipt", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "Note", "PositionGps", "PositionText", "FromDevice", "TotalPayed", "TotalMustPayment", "InsurantTime", "TimeTicketCreate", "NextTimePayment", "Reason", "ReasonName", "StoreCodeReceipt", "PaymentStatus", "PaymentStatusName", "CreatedBy");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<MaterialStoreExpModel>(), jTablePara.Draw, 0, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserExport", "UserExportName", "UserReceipt", "CostTotal", "Currency", "CurrencyName", "Discount", "Commission", "TaxTotal", "Note", "PositionGps", "PositionText", "FromDevice", "TotalPayed", "TotalMustPayment", "InsurantTime", "TimeTicketCreate", "NextTimePayment", "Reason", "ReasonName", "StoreCodeReceipt", "PaymentStatus", "PaymentStatusName", "CreatedBy");
                return Json(jdata);
            }
        }

        [HttpPost]
        public object GridDataOfUser([FromBody]JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [HttpPost]
        public object GridDataOfBranch([FromBody]JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [HttpPost]
        public object GridDataOfAdmin([FromBody]JTableModelMaterialStoreExpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 10);
        }

        [NonAction]
        public IQueryable<MaterialStoreExpModel> FuncJTable(int userType, string Title, string CusCode, string StoreCode, string UserExport, string FromDate, string ToDate, string Reason)
        {
            var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProdDeliveryHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.UserExport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON") on a.Reason equals e.CodeSet
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS") on a.PaymentStatus equals f.CodeSet
                         //join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals g.CodeSet
                         join b in _context.Customerss.Where(x => x.IsDeleted != true) on a.CusCode equals b.CusCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(Title) || (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                         && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                         && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                         && (string.IsNullOrEmpty(UserExport) || (a.UserExport == UserExport))
                         && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                         && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                         && (string.IsNullOrEmpty(Reason) || (a.Reason == Reason))

                             //Điều kiện phân quyền dữ liệu
                             && (userType == 10
                                    || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                    || (userType == 0 && session.UserName == a.CreatedBy)
                                )
                         select new MaterialStoreExpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             //QrTicketCode = CommonUtil.GeneratorQRCode(a.TicketCode),
                             ContractCode = a.ContractCode,
                             CusCode = a.CusCode,
                             CusName = b2 != null ? b2.CusName : "",
                             StoreCode = a.StoreCode,
                             StoreName = c.WHS_Name,
                             Title = a.Title,
                             UserExport = a.UserExport,
                             UserExportName = d.GivenName,
                             UserReceipt = a.UserReceipt,
                             CostTotal = a.CostTotal,
                             Currency = a.Currency,
                             //CurrencyName = g.ValueSet,
                             CurrencyName = "",
                             Discount = a.Discount,
                             Commission = a.Commission,
                             TaxTotal = a.TaxTotal,
                             Note = a.Note,
                             PositionGps = a.PositionGps,
                             PositionText = a.PositionText,
                             FromDevice = a.FromDevice,
                             TotalPayed = a.TotalPayed,
                             TotalMustPayment = a.TotalMustPayment,
                             InsurantTime = a.InsurantTime,
                             TimeTicketCreate = a.TimeTicketCreate,
                             NextTimePayment = a.NextTimePayment,
                             Reason = a.Reason,
                             ReasonName = e.ValueSet,
                             StoreCodeReceipt = a.StoreCodeReceipt,
                             PaymentStatus = a.PaymentStatus,
                             PaymentStatusName = f.ValueSet,
                             CreatedBy = a.CreatedBy,
                         });
            return query;
        }

        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProdDeliveryHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.ContractCode,
                    x.CusCode,
                    x.Reason,
                    x.StoreCodeReceipt,
                    x.CostTotal,
                    x.Currency,
                    x.Discount,
                    x.TaxTotal,
                    x.Commission,
                    x.TotalMustPayment,
                    x.TotalPayed,
                    x.PaymentStatus,
                    NextTimePayment = x.NextTimePayment.HasValue ? x.NextTimePayment.Value.ToString("dd/MM/yyyy") : "",
                    x.UserExport,
                    x.Note,
                    x.UserReceipt,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                }).FirstOrDefault();

                var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                    join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                    join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                    from c2 in c1.DefaultIfEmpty()
                                    select new
                                    {
                                        a.ProductCode,
                                        a.ProductType,
                                        b.SupCode,
                                        c2.SupName
                                    }).ToList();

                var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
                {
                    p.First().ProductCode,
                    p.First().ProductType,
                    SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                    SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
                }).ToList();

                //var ListProduct = (from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                //                   join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                //                   join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                //                   join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                //                   join c in _context.EDMSLines on b.LineCode equals c.LineCode
                //                   join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                //                   join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
                //                   join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                //                   //join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                //                   //from e2 in e1.DefaultIfEmpty()
                //                   join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                //                   join f in _context.ProdReceivedHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                //                   join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.CusCode equals h.SupCode into h1
                //                   from h2 in h1.DefaultIfEmpty()
                //                   let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                //                   orderby b1.ProductName
                //                   select new
                //                   {
                //                       ProductCode = a1.ProductCode,
                //                       ProductType = "FINISHED_PRODUCT",
                //                       ProductName = "Thành phẩm _ " + b1.ProductName,
                //                       ProductQrCode = a1.ProductQrCode,
                //                       sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                //                       Unit = a1.Unit,
                //                       UnitName = c1.ValueSet,

                //                       Quantity = g.Quantity,
                //                       RackCode = a.RackCode,
                //                       RackName = name,
                //                       ProductCoil = g.ProductCoil,
                //                       SupCode = f.CusCode,
                //                       SupName = h2.SupName
                //                   })
                //                 .Concat(from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                //                         join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                //                         join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                //                         join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                //                         join c in _context.EDMSLines on b.LineCode equals c.LineCode
                //                         join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                //                         join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
                //                         join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                //                         join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                //                         //join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                //                         //from e2 in e1.DefaultIfEmpty()
                //                         join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                //                         join f in _context.ProdReceivedHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                //                         join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.CusCode equals h.SupCode into h1
                //                         from h2 in h1.DefaultIfEmpty()
                //                         let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                //                         orderby b1.AttributeName
                //                         select new
                //                         {
                //                             ProductCode = a1.ProductCode,
                //                             ProductType = "SUB_PRODUCT",
                //                             ProductName = d.ProductCode + " _ " + b1.AttributeName,
                //                             ProductQrCode = a1.ProductQrCode,
                //                             sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                //                             Unit = a1.Unit,
                //                             UnitName = c1.ValueSet,
                //                             Quantity = g.Quantity,
                //                             RackCode = a.RackCode,
                //                             RackName = name,
                //                             ProductCoil = g.ProductCoil,
                //                             SupCode = f.CusCode,
                //                             SupName = h2.SupName
                //                         })
                //                   .ToList();
                var ListPoProduct = (from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT" && y.TicketCode == item.TicketCode)
                                     join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                     join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductCode
                                     //join e1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.LotProductCode equals e1.ContractCode into e2
                                     //from e in e2.DefaultIfEmpty()
                                     join c in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                     from c1 in c2.DefaultIfEmpty()
                                     join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                     from e2 in e1.DefaultIfEmpty()
                                         //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                         //let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                     let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
                                     //let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                     let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
                                     orderby b1.ProductName
                                     select new
                                     {
                                         ProductCode = a.ProductCode,
                                         ProductName = "Thành phẩm _ " + b1.ProductName,
                                         ProductType = "FINISHED_PRODUCT",
                                         //ProductQrCode = productQrCode,
                                         //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                         Unit = b1.Unit,
                                         UnitName = (c1 != null ? c1.ValueSet : ""),
                                         QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                         QuantityNeedExport = a1.QuantityNeedExport,
                                         Quantity = a.Quantity,
                                         ProductCoil = a.ProductCoil,
                                         //QuantityInStockTotal = (decimal)b1.InStock,
                                         QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                         QuantityInStock = productInStock != null ? productInStock : 0,
                                         QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                         //ListProductInRack = (from a3 in _context.ProductInStockExps.Where(y => y.TicketCode == item.TicketCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT")
                                         //                     join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                         //                     join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                         //                     join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                         //                     join f3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductCode
                                         //                     join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                         //                     let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                         //                     orderby f3.ProductName
                                         //                     select new
                                         //                     {
                                         //                         ProductCode = a3.ProductCode,
                                         //                         ProductType = "FINISHED_PRODUCT",
                                         //                         ProductName = "Thành phẩm _ " + f3.ProductName,
                                         //                         ProductQrCode = a3.ProductQrCode,
                                         //                         sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                         //                         Unit = f3.Unit,
                                         //                         UnitName = g3.ValueSet,

                                         //                         Quantity = a3.Quantity,
                                         //                         RackCode = a3.RackCode,
                                         //                         RackName = name,
                                         //                         ProductCoil = a3.ProductCoil,
                                         //                     }),
                                         e2.SupCode,
                                         e2.SupName
                                     })
                               .Concat(from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT" && y.TicketCode == item.TicketCode)
                                       join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                       join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                       join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                       join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                       from c1 in c2.DefaultIfEmpty()
                                       join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                       from e2 in e1.DefaultIfEmpty()
                                           //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           //let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                       let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
                                       //let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                       let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
                                       orderby b1.AttributeName
                                       select new
                                       {
                                           ProductCode = a.ProductCode,
                                           ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                           ProductType = "SUB_PRODUCT",
                                           //ProductQrCode = productQrCode,
                                           //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                           Unit = b1.Unit,
                                           UnitName = (c1 != null ? c1.ValueSet : ""),
                                           QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                           QuantityNeedExport = a1.QuantityNeedExport,
                                           Quantity = a.Quantity,
                                           ProductCoil = a.ProductCoil,
                                           //QuantityInStockTotal = (decimal)b1.InStock,
                                           QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                           QuantityInStock = productInStock != null ? productInStock : 0,
                                           QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                           //ListProductInRack = (from a3 in _context.ProductInStockExps.Where(y => y.TicketCode == item.TicketCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT")
                                           //                     join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                           //                     join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                           //                     join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                           //                     join f3 in _context.SubProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductQrCode
                                           //                     join i3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on f3.ProductCode equals i3.ProductCode
                                           //                     join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                           //                     let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                           //                     orderby f3.AttributeName
                                           //                     select new
                                           //                     {
                                           //                         ProductCode = a3.ProductCode,
                                           //                         ProductType = "SUB_PRODUCT",
                                           //                         ProductName = i3.ProductCode + " _ " + f3.AttributeName,
                                           //                         ProductQrCode = a3.ProductQrCode,
                                           //                         sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                           //                         Unit = f3.Unit,
                                           //                         UnitName = g3.ValueSet,

                                           //                         Quantity = a3.Quantity,
                                           //                         RackCode = a3.RackCode,
                                           //                         RackName = name,
                                           //                         ProductCoil = a3.ProductCoil,
                                           //                     }),
                                           e2.SupCode,
                                           e2.SupName
                                       })
                                   .ToList();

                mess.Object = new { Header = item, ListPoProduct };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MES_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [HttpPost]
        public JsonResult GetListProductGrid([FromBody]int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProdDeliveryHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.TicketCode,
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                                   join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                   join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                   join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                   join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                   join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                   join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                   join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                                   join f in _context.ProdReceivedHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                                   join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.CusCode equals h.SupCode into h1
                                   from h2 in h1.DefaultIfEmpty()
                                   let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                   orderby b1.ProductName
                                   select new
                                   {
                                       g.Id,
                                       ProductCode = a1.ProductCode,
                                       ProductType = "FINISHED_PRODUCT",
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductQrCode = a1.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                       Unit = a1.Unit,
                                       UnitName = c1.ValueSet,

                                       Quantity = g.Quantity,
                                       RackCode = a.RackCode,
                                       RackName = name,
                                       ProductCoil = g.ProductCoil,
                                       SupCode = f.CusCode,
                                       SupName = h2.SupName,
                                       e.ProductLot
                                   })
                                 .Concat(from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
                                         join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                         join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                         join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                         join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                         join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                         join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
                                         join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                         join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                         join e in _context.ProdPackageReceiveds.Where(y => !y.IsDeleted) on g.ProductCoil equals e.CoilCode
                                         join f in _context.ProdReceivedHeaders.Where(y => !y.IsDeleted) on e.TicketCode equals f.TicketCode
                                         join h in _context.Suppliers.Where(y => !y.IsDeleted) on f.CusCode equals h.SupCode into h1
                                         from h2 in h1.DefaultIfEmpty()
                                         let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                         orderby b1.AttributeName
                                         select new
                                         {
                                             g.Id,
                                             ProductCode = a1.ProductCode,
                                             ProductType = "SUB_PRODUCT",
                                             ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                             ProductQrCode = a1.ProductQrCode,
                                             sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                             Unit = a1.Unit,
                                             UnitName = c1.ValueSet,
                                             Quantity = g.Quantity,
                                             RackCode = a.RackCode,
                                             RackName = name,
                                             ProductCoil = g.ProductCoil,
                                             SupCode = f.CusCode,
                                             SupName = h2.SupName,
                                             e.ProductLot
                                         })
                                   .ToList();

                mess.Object = new { ListProduct };
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MES_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        #region Xử lý cũ - truyền cả list Detail Coil
        //[HttpPost]
        //public JsonResult GetItem([FromBody]int id)
        //{
        //    var mess = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var item = _context.ProdDeliveryHeaders.Where(x => x.Id == id).Select(x => new
        //        {
        //            x.LotProductCode,
        //            x.TicketCode,
        //            x.Title,
        //            x.StoreCode,
        //            x.ContractCode,
        //            x.CusCode,
        //            x.Reason,
        //            x.StoreCodeReceipt,
        //            x.CostTotal,
        //            x.Currency,
        //            x.Discount,
        //            x.TaxTotal,
        //            x.Commission,
        //            x.TotalMustPayment,
        //            x.TotalPayed,
        //            x.PaymentStatus,
        //            NextTimePayment = x.NextTimePayment.HasValue ? x.NextTimePayment.Value.ToString("dd/MM/yyyy") : "",
        //            x.UserExport,
        //            x.Note,
        //            x.UserReceipt,
        //            InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
        //            TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
        //        }).FirstOrDefault();

        //        var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
        //                            join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
        //                            join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
        //                            from c2 in c1.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                a.ProductCode,
        //                                a.ProductType,
        //                                b.SupCode,
        //                                c2.SupName
        //                            }).ToList();

        //        var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
        //        {
        //            p.First().ProductCode,
        //            p.First().ProductType,
        //            SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
        //            SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
        //        }).ToList();

        //        var ListProduct = (from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
        //                           join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
        //                           join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
        //                           join b in _context.EDMSRacks on a.RackCode equals b.RackCode
        //                           join c in _context.EDMSLines on b.LineCode equals c.LineCode
        //                           join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
        //                           join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
        //                           join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
        //                           join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
        //                           from e2 in e1.DefaultIfEmpty()
        //                           let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
        //                           orderby b1.ProductName
        //                           select new
        //                           {
        //                               ProductCode = a1.ProductCode,
        //                               ProductType = "FINISHED_PRODUCT",
        //                               ProductName = "Thành phẩm _ " + b1.ProductName,
        //                               ProductQrCode = a1.ProductQrCode,
        //                               sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
        //                               Unit = a1.Unit,
        //                               UnitName = c1.ValueSet,

        //                               Quantity = g.Quantity,
        //                               RackCode = a.RackCode,
        //                               RackName = name,
        //                               ProductCoil = g.ProductCoil,
        //                               e2.SupCode,
        //                               e2.SupName
        //                           })
        //                         .Concat(from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && string.IsNullOrEmpty(y.LotProductCode))
        //                                 join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
        //                                 join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
        //                                 join b in _context.EDMSRacks on a.RackCode equals b.RackCode
        //                                 join c in _context.EDMSLines on b.LineCode equals c.LineCode
        //                                 join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
        //                                 join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
        //                                 join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
        //                                 join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
        //                                 join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
        //                                 from e2 in e1.DefaultIfEmpty()
        //                                 let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
        //                                 orderby b1.AttributeName
        //                                 select new
        //                                 {
        //                                     ProductCode = a1.ProductCode,
        //                                     ProductType = "SUB_PRODUCT",
        //                                     ProductName = d.ProductCode + " _ " + b1.AttributeName,
        //                                     ProductQrCode = a1.ProductQrCode,
        //                                     sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
        //                                     Unit = a1.Unit,
        //                                     UnitName = c1.ValueSet,
        //                                     Quantity = g.Quantity,
        //                                     RackCode = a.RackCode,
        //                                     RackName = name,
        //                                     ProductCoil = g.ProductCoil,
        //                                     e2.SupCode,
        //                                     e2.SupName
        //                                 })
        //                           .ToList();
        //        var ListPoProduct = (from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT" && y.TicketCode == item.TicketCode)
        //                             join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
        //                             join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductCode
        //                             //join e1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.LotProductCode equals e1.ContractCode into e2
        //                             //from e in e2.DefaultIfEmpty()
        //                             join c in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
        //                             from c1 in c2.DefaultIfEmpty()
        //                             join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
        //                             from e2 in e1.DefaultIfEmpty()
        //                                 //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
        //                                 //let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
        //                             let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
        //                             //let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
        //                             let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity)
        //                             orderby b1.ProductName
        //                             select new
        //                             {
        //                                 ProductCode = a.ProductCode,
        //                                 ProductName = "Thành phẩm _ " + b1.ProductName,
        //                                 ProductType = "FINISHED_PRODUCT",
        //                                 //ProductQrCode = productQrCode,
        //                                 //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
        //                                 Unit = b1.Unit,
        //                                 UnitName = (c1 != null ? c1.ValueSet : ""),
        //                                 QuantityOrder = a1.QuantityNeedExport + a.Quantity,
        //                                 QuantityNeedExport = a1.QuantityNeedExport,
        //                                 Quantity = a.Quantity,
        //                                 ProductCoil = a.ProductCoil,
        //                                 //QuantityInStockTotal = (decimal)b1.InStock,
        //                                 QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
        //                                 QuantityInStock = productInStock != null ? productInStock : 0,
        //                                 QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
        //                                 ListProductInRack = (from a3 in _context.ProductInStockExps.Where(y => y.TicketCode == item.TicketCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT")
        //                                                      join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
        //                                                      join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
        //                                                      join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
        //                                                      join f3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductCode
        //                                                      join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
        //                                                      let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
        //                                                      orderby f3.ProductName
        //                                                      select new
        //                                                      {
        //                                                          ProductCode = a3.ProductCode,
        //                                                          ProductType = "FINISHED_PRODUCT",
        //                                                          ProductName = "Thành phẩm _ " + f3.ProductName,
        //                                                          ProductQrCode = a3.ProductQrCode,
        //                                                          sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
        //                                                          Unit = f3.Unit,
        //                                                          UnitName = g3.ValueSet,

        //                                                          Quantity = a3.Quantity,
        //                                                          RackCode = a3.RackCode,
        //                                                          RackName = name,
        //                                                          ProductCoil = a3.ProductCoil,
        //                                                      }),
        //                                 e2.SupCode,
        //                                 e2.SupName
        //                             })
        //                       .Concat(from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT" && y.TicketCode == item.TicketCode)
        //                               join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
        //                               join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductQrCode
        //                               join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
        //                               join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
        //                               from c1 in c2.DefaultIfEmpty()
        //                               join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
        //                               from e2 in e1.DefaultIfEmpty()
        //                                   //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
        //                                   //let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
        //                               let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
        //                               //let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
        //                               let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == item.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity)
        //                               orderby b1.AttributeName
        //                               select new
        //                               {
        //                                   ProductCode = a.ProductCode,
        //                                   ProductName = d.ProductCode + " _ " + b1.AttributeName,
        //                                   ProductType = "SUB_PRODUCT",
        //                                   //ProductQrCode = productQrCode,
        //                                   //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
        //                                   Unit = b1.Unit,
        //                                   UnitName = (c1 != null ? c1.ValueSet : ""),
        //                                   QuantityOrder = a1.QuantityNeedExport + a.Quantity,
        //                                   QuantityNeedExport = a1.QuantityNeedExport,
        //                                   Quantity = a.Quantity,
        //                                   ProductCoil = a.ProductCoil,
        //                                   //QuantityInStockTotal = (decimal)b1.InStock,
        //                                   QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
        //                                   QuantityInStock = productInStock != null ? productInStock : 0,
        //                                   QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
        //                                   ListProductInRack = (from a3 in _context.ProductInStockExps.Where(y => y.TicketCode == item.TicketCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT")
        //                                                        join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
        //                                                        join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
        //                                                        join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
        //                                                        join f3 in _context.SubProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductQrCode
        //                                                        join i3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on f3.ProductCode equals i3.ProductCode
        //                                                        join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
        //                                                        let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
        //                                                        orderby f3.AttributeName
        //                                                        select new
        //                                                        {
        //                                                            ProductCode = a3.ProductCode,
        //                                                            ProductType = "SUB_PRODUCT",
        //                                                            ProductName = i3.ProductCode + " _ " + f3.AttributeName,
        //                                                            ProductQrCode = a3.ProductQrCode,
        //                                                            sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
        //                                                            Unit = f3.Unit,
        //                                                            UnitName = g3.ValueSet,

        //                                                            Quantity = a3.Quantity,
        //                                                            RackCode = a3.RackCode,
        //                                                            RackName = name,
        //                                                            ProductCoil = a3.ProductCoil,
        //                                                        }),
        //                                   e2.SupCode,
        //                                   e2.SupName
        //                               })
        //                           .ToList();

        //        mess.Object = new { Header = item, ListProduct, ListPoProduct };
        //    }
        //    catch (Exception ex)
        //    {
        //        mess.Error = true;
        //        mess.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_IMPORT_WARE_HOURE_EXITS"));
        //    }
        //    return Json(mess);
        //}
        //[HttpPost]
        //public JsonResult Insert([FromBody]MaterialStoreExpModelInsert obj)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        //var isChangeContract = false;
        //        var poOldTime = DateTime.Now;
        //        var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
        //        if (!chk)
        //        {
        //            //Xóa bỏ lịch sử khởi tạo lại
        //            var prodPackageInfoHistorys =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketExpCode.Equals(obj.TicketCode));
        //            if (prodPackageInfoHistorys != null)
        //            {
        //                foreach (var prodPackageInfoHistory in prodPackageInfoHistorys)
        //                {
        //                    prodPackageInfoHistory.IsDeleted = true;
        //                }
        //               _context.ProdPackageDeliverys.UpdateRange(prodPackageInfoHistorys);
        //            }

        //            //Insert bảng header
        //            var objNew = new ProdDeliveryHeader
        //            {
        //                LotProductCode = obj.LotProductCode,
        //                TicketCode = obj.TicketCode,
        //                Title = obj.Title,
        //                StoreCode = obj.StoreCode,
        //                ContractCode = obj.ContractCode,
        //                CusCode = obj.CusCode,
        //                Reason = obj.Reason,
        //                StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "",
        //                CostTotal = obj.CostTotal,
        //                Currency = obj.Currency,
        //                Discount = obj.Discount,
        //                TaxTotal = obj.TaxTotal,
        //                Commission = obj.Commission,
        //                TotalMustPayment = obj.TotalMustPayment,
        //                TotalPayed = obj.TotalPayed,
        //                PaymentStatus = obj.Currency == "CURRENCY_VND"
        //                                        ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
        //                                        : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE",
        //                NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
        //                UserExport = obj.UserExport,
        //                Note = obj.Note,
        //                UserReceipt = obj.UserReceipt,
        //                InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
        //                TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,

        //                CreatedBy = ESEIM.AppContext.UserName,
        //                CreatedTime = DateTime.Now,
        //            };
        //            _context.ProdDeliveryHeaders.Add(objNew);

        //            //Xử lý khi xuất lẻ
        //            if (obj.ListPoProduct.Count == 0)
        //            {
        //                var headerCode = string.Empty;
        //                var dateNow = DateTime.Now;

        //                var listSalePrice = _context.ProductCostHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.EffectiveDate).ToList();
        //                var salePriceApply = listSalePrice.FirstOrDefault(x => !x.IsDeleted && x.EffectiveDate <= dateNow && x.ExpiryDate >= dateNow);
        //                if (salePriceApply != null)
        //                {
        //                    headerCode = salePriceApply.HeaderCode;
        //                }
        //                else
        //                {
        //                    headerCode = listSalePrice.Where(x => dateNow >= x.ExpiryDate).FirstOrDefault().HeaderCode;
        //                }

        //                if (!string.IsNullOrEmpty(headerCode))
        //                {
        //                    foreach (var item in obj.ListProduct)
        //                    {
        //                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.ProductCoil));

        //                        var prodPackageInfoHistory = new ProdPackageInfoHistory
        //                        {
        //                            CoilCode = prodPackageInfo.CoilCode,
        //                            CoilRelative = prodPackageInfo.CoilRelative,
        //                            CreatedBy = prodPackageInfo.CreatedBy,
        //                            CreatedTime = prodPackageInfo.CreatedTime,
        //                            DeletedBy = prodPackageInfo.DeletedBy,
        //                            DeletedTime = prodPackageInfo.DeletedTime,
        //                            IsDeleted = prodPackageInfo.IsDeleted,
        //                            LineCode = prodPackageInfo.LineCode,
        //                            PackType = prodPackageInfo.PackType,
        //                            PositionInStore = prodPackageInfo.PositionInStore,
        //                            ProductCoil = prodPackageInfo.ProductCoil,
        //                            ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
        //                            ProductQrCode = prodPackageInfo.ProductQrCode,
        //                            ProductCode = prodPackageInfo.ProductCode,
        //                            ProductType = prodPackageInfo.ProductType,
        //                            ProductLot = prodPackageInfo.ProductLot,
        //                            RackCode = prodPackageInfo.RackCode,
        //                            RackPosition = prodPackageInfo.RackPosition,
        //                            Remain = (int)item.Quantity,
        //                            Size = (int)item.Quantity,
        //                            TicketCode = prodPackageInfo.TicketCode,
        //                            TicketExpCode = obj.TicketCode,
        //                            UpdatedBy = prodPackageInfo.UpdatedBy,
        //                            UpdatedTime = prodPackageInfo.UpdatedTime,
        //                        };

        //                       _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);

        //                        if (prodPackageInfo != null)
        //                        {
        //                            prodPackageInfo.Remain = prodPackageInfo.Remain > item.Quantity ? prodPackageInfo.Remain - item.Quantity : 0;
        //                            _context.ProdPackageReceiveds.Update(prodPackageInfo);
        //                        }

        //                        decimal salePrice = 0;
        //                        var productCostDetail = _context.ProductCostDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode) && x.HeaderCode.Equals(headerCode));
        //                        if (productCostDetail != null)
        //                        {
        //                            if (productCostDetail.PriceCostDefault != null)
        //                                salePrice = (decimal)productCostDetail.PriceCostDefault;
        //                        }

        //                        //Insert bảng detail
        //                        var objNewDetail = new ProdDeliveryDetail
        //                        {
        //                            LotProductCode = obj.LotProductCode,
        //                            TicketCode = obj.TicketCode,
        //                            Currency = obj.Currency,

        //                            ProductCode = item.ProductCode,
        //                            ProductType = item.ProductType,
        //                            ProductQrCode = item.ProductQrCode,
        //                            Quantity = item.Quantity,
        //                            Unit = item.Unit,
        //                            SalePrice = salePrice,
        //                            TaxRate = item.TaxRate,
        //                            Discount = item.Discount,
        //                            Commission = item.Commission,
        //                            RackCode = item.RackCode,

        //                            ProductCoil = item.ProductCoil,
        //                            CreatedBy = ESEIM.AppContext.UserName,
        //                            CreatedTime = DateTime.Now,
        //                        };
        //                        _context.ProdDeliveryDetails.Add(objNewDetail);

        //                        //Bỏ sản phẩm ra khỏi bảng Kho
        //                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
        //                        if (storeInventory != null)
        //                        {
        //                            storeInventory.Quantity = storeInventory.Quantity - item.Quantity;
        //                            _context.ProductInStocks.Update(storeInventory);
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_WARE_HOURE"));
        //                            return Json(msg);
        //                        }

        //                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
        //                        var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                        if (mapping != null)
        //                        {
        //                            mapping.Quantity = mapping.Quantity - item.Quantity;
        //                            //if (mapping.Quantity == 0)
        //                            //{
        //                            //    mapping.IsDeleted = true;
        //                            //}
        //                            mapping.UpdatedBy = User.Identity.Name;
        //                            mapping.UpdatedTime = DateTime.Now;
        //                            _context.ProductEntityMappings.Update(mapping);
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                            return Json(msg);
        //                        }

        //                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping_Log
        //                        var mappingLogs = _context.ProductEntityMappingLogs.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                        if (mappingLogs != null)
        //                        {
        //                            var quantity = item.Quantity;
        //                            foreach (var log in mappingLogs)
        //                            {
        //                                if (log.Quantity > 0 && quantity > 0)
        //                                {
        //                                    if (log.Quantity > quantity)
        //                                    {
        //                                        log.Quantity = log.Quantity - quantity;
        //                                        quantity = 0;
        //                                    }
        //                                    else
        //                                    {
        //                                        quantity = quantity - (decimal)log.Quantity;
        //                                        log.Quantity = 0;
        //                                    }

        //                                    //if (mapping.Quantity == 0)
        //                                    //{
        //                                    //    mapping.IsDeleted = true;
        //                                    //}
        //                                    log.UpdatedBy = User.Identity.Name;
        //                                    log.UpdatedTime = DateTime.Now;
        //                                    _context.ProductEntityMappingLogs.Update(log);
        //                                }
        //                            }
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                            return Json(msg);
        //                        }

        //                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
        //                        if (item.ProductType == "SUB_PRODUCT")
        //                        {
        //                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
        //                            if (subProduct != null)
        //                            {
        //                                subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock - item.Quantity;
        //                                _context.SubProducts.Update(subProduct);
        //                            }
        //                        }
        //                        else if (item.ProductType == "FINISHED_PRODUCT")
        //                        {
        //                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
        //                            if (product != null)
        //                            {
        //                                product.InStock = product.InStock == null ? item.Quantity : product.InStock - item.Quantity;
        //                                _context.MaterialProducts.Update(product);
        //                            }
        //                        }
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không có bảng giá. Vui lòng tạo bảng giá";
        //                    return Json(msg);
        //                }
        //            }
        //            //Xử lý khi xuất theo PO
        //            //Lấy ra đủ số lượng bất kỳ trong kho - ProductInStock => Lấy được ProductQrCode
        //            //Sau đó mới insert vào bảng Detail của Export
        //            else
        //            {
        //                foreach (var item in obj.ListPoProduct)
        //                {
        //                    if (item.ListProductInRack != null)
        //                    {
        //                        foreach (var itemCoil in item.ListProductInRack)
        //                        {
        //                            var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(itemCoil.ProductCoil));
        //                            if (prodPackageInfo != null)
        //                            {
        //                                prodPackageInfo.Remain = prodPackageInfo.Remain > itemCoil.Quantity ? prodPackageInfo.Remain - itemCoil.Quantity : 0;
        //                                _context.ProdPackageReceiveds.Update(prodPackageInfo);

        //                                var prodPackageInfoHistory = new ProdPackageInfoHistory
        //                                {
        //                                    CoilCode = prodPackageInfo.CoilCode,
        //                                    CoilRelative = prodPackageInfo.CoilRelative,
        //                                    CreatedBy = prodPackageInfo.CreatedBy,
        //                                    CreatedTime = prodPackageInfo.CreatedTime,
        //                                    DeletedBy = prodPackageInfo.DeletedBy,
        //                                    DeletedTime = prodPackageInfo.DeletedTime,
        //                                    IsDeleted = prodPackageInfo.IsDeleted,
        //                                    LineCode = prodPackageInfo.LineCode,
        //                                    PackType = prodPackageInfo.PackType,
        //                                    PositionInStore = prodPackageInfo.PositionInStore,
        //                                    ProductCoil = prodPackageInfo.ProductCoil,
        //                                    ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
        //                                    ProductQrCode = prodPackageInfo.ProductQrCode,
        //                                    ProductCode = prodPackageInfo.ProductCode,
        //                                    ProductType = prodPackageInfo.ProductType,
        //                                    ProductLot = prodPackageInfo.ProductLot,
        //                                    RackCode = prodPackageInfo.RackCode,
        //                                    RackPosition = prodPackageInfo.RackPosition,
        //                                    Remain = (int)itemCoil.Quantity,
        //                                    Size = (int)itemCoil.Quantity,
        //                                    TicketCode = prodPackageInfo.TicketCode,
        //                                    TicketExpCode = obj.TicketCode,
        //                                    UpdatedBy = prodPackageInfo.UpdatedBy,
        //                                    UpdatedTime = prodPackageInfo.UpdatedTime,
        //                                };

        //                               _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);
        //                            }
        //                        }
        //                    }

        //                    //Insert bảng detail - mỗi sản phẩm chỉ 1 bản ghi (Ko nhập QrCode nữa)
        //                    var objNewDetail = new ProdDeliveryDetail
        //                    {
        //                        LotProductCode = obj.LotProductCode,
        //                        TicketCode = obj.TicketCode,
        //                        Currency = obj.Currency,

        //                        ProductCode = item.ProductCode,
        //                        ProductType = item.ProductType,
        //                        Quantity = item.Quantity,
        //                        Unit = item.Unit,

        //                        ProductCoil = item.ProductCoil,
        //                        CreatedBy = ESEIM.AppContext.UserName,
        //                        CreatedTime = DateTime.Now,
        //                    };
        //                    _context.ProdDeliveryDetails.Add(objNewDetail);


        //                    ////Bỏ sản phẩm ra khỏi bảng Kho
        //                    ////Phương án cũ => Lấy bất kỳ
        //                    //var baseQuantity = item.Quantity;
        //                    //var listStoreInventory = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == obj.StoreCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType).ToList();
        //                    //foreach (var itemStock in listStoreInventory)
        //                    //{
        //                    //    if (baseQuantity <= itemStock.Quantity)
        //                    //    {
        //                    //        itemStock.Quantity = itemStock.Quantity - baseQuantity;
        //                    //        _context.ProductInStocks.Update(itemStock);

        //                    //        //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                    //        var objProductInStockExp = new ProductInStockExp
        //                    //        {
        //                    //            TicketCode = obj.TicketCode,
        //                    //            ProductCode = itemStock.ProductCode,
        //                    //            ProductType = itemStock.ProductType,
        //                    //            ProductQrCode = itemStock.ProductQrCode,
        //                    //            Quantity = baseQuantity,
        //                    //        };
        //                    //        _context.ProductInStockExps.Add(objProductInStockExp);

        //                    //        ////Phần xử lý mapping không xử lý nữa

        //                    //        break;
        //                    //    }
        //                    //    else
        //                    //    {
        //                    //        baseQuantity = baseQuantity - itemStock.Quantity;
        //                    //        itemStock.Quantity = 0;
        //                    //        _context.ProductInStocks.Update(itemStock);

        //                    //        //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                    //        var objProductInStockExp = new ProductInStockExp
        //                    //        {
        //                    //            TicketCode = obj.TicketCode,
        //                    //            ProductCode = itemStock.ProductCode,
        //                    //            ProductType = itemStock.ProductType,
        //                    //            ProductQrCode = itemStock.ProductQrCode,
        //                    //            Quantity = itemStock.Quantity,
        //                    //        };
        //                    //        _context.ProductInStockExps.Add(objProductInStockExp);

        //                    //        ////Phần xử lý mapping không xử lý nữa
        //                    //    }
        //                    //}

        //                    if (item.Quantity > 0)
        //                    {
        //                        //Bỏ sản phẩm ra khỏi bảng Kho
        //                        if (item.ListProductInRack != null && item.ListProductInRack.Any())
        //                        {
        //                            foreach (var itemStock in item.ListProductInRack)
        //                            {
        //                                var productInStocks = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(itemStock.ProductQrCode));
        //                                if (productInStocks != null)
        //                                {
        //                                    productInStocks.Quantity = productInStocks.Quantity - itemStock.Quantity;
        //                                    _context.ProductInStocks.Update(productInStocks);

        //                                    //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                                    var objProductInStockExp = new ProductInStockExp
        //                                    {
        //                                        TicketCode = obj.TicketCode,
        //                                        ProductCode = productInStocks.ProductCode,
        //                                        ProductType = productInStocks.ProductType,
        //                                        ProductQrCode = productInStocks.ProductQrCode,
        //                                        Quantity = itemStock.Quantity,
        //                                        RackCode = itemStock.RackCode,
        //                                        ProductCoil = itemStock.ProductCoil,
        //                                    };
        //                                    _context.ProductInStockExps.Add(objProductInStockExp);
        //                                }

        //                                //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
        //                                var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(itemStock.ProductQrCode) && x.RackCode.Equals(itemStock.RackCode));
        //                                if (mapping != null)
        //                                {
        //                                    mapping.Quantity = mapping.Quantity - itemStock.Quantity;
        //                                    mapping.UpdatedBy = User.Identity.Name;
        //                                    mapping.UpdatedTime = DateTime.Now;
        //                                    _context.ProductEntityMappings.Update(mapping);
        //                                }

        //                                //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping_Log
        //                                var mappingLogs = _context.ProductEntityMappingLogs.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(itemStock.ProductQrCode) && x.RackCode.Equals(itemStock.RackCode));
        //                                if (mappingLogs != null)
        //                                {
        //                                    var quantity = itemStock.Quantity;
        //                                    foreach (var log in mappingLogs)
        //                                    {
        //                                        if (log.Quantity > 0 && quantity > 0)
        //                                        {
        //                                            if (log.Quantity > quantity)
        //                                            {
        //                                                log.Quantity = log.Quantity - quantity;
        //                                                quantity = 0;
        //                                            }
        //                                            else
        //                                            {
        //                                                quantity = quantity - (decimal)log.Quantity;
        //                                                log.Quantity = 0;
        //                                            }

        //                                            //if (mapping.Quantity == 0)
        //                                            //{
        //                                            //    mapping.IsDeleted = true;
        //                                            //}
        //                                            log.UpdatedBy = User.Identity.Name;
        //                                            log.UpdatedTime = DateTime.Now;
        //                                            _context.ProductEntityMappingLogs.Update(log);
        //                                        }
        //                                    }
        //                                }
        //                                else
        //                                {
        //                                    msg.Error = true;
        //                                    msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                                    return Json(msg);
        //                                }

        //                            }
        //                        }

        //                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
        //                        if (item.ProductType == "SUB_PRODUCT")
        //                        {
        //                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
        //                            if (subProduct != null)
        //                            {
        //                                subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock - item.Quantity;
        //                                _context.SubProducts.Update(subProduct);
        //                            }
        //                        }
        //                        else if (item.ProductType == "FINISHED_PRODUCT")
        //                        {
        //                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
        //                            if (product != null)
        //                            {
        //                                product.InStock = product.InStock == null ? item.Quantity : product.InStock - item.Quantity;
        //                                _context.MaterialProducts.Update(product);
        //                            }
        //                        }

        //                        //Giảm lượng sản phẩm còn phải xuất trong bảng PO_Product_Detail
        //                        var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == obj.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
        //                        if (poProductDetail != null)
        //                        {
        //                            poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport > item.Quantity ? poProductDetail.QuantityNeedExport - item.Quantity : 0;
        //                            _context.PoSaleProductDetails.Update(poProductDetail);
        //                        }
        //                    }
        //                }
        //            }

        //            _context.SaveChanges();

        //            if (obj.ListPoProduct.Count == 0)
        //            {
        //                //export lẻ
        //                foreach (var item in obj.ListProduct)
        //                {
        //                    string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
        //                    object[] val = new object[] { item.ProductCode, item.Quantity, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
        //                    _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
        //                }
        //            }
        //            else
        //            {
        //                //export PO CUS
        //                foreach (var item in obj.ListPoProduct)
        //                {
        //                    string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
        //                    object[] val = new object[] { item.ProductCode, item.Quantity, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
        //                    _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
        //                }
        //            }

        //            //Thêm log dữ liệu
        //            var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
        //            var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
        //            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
        //            var detailQrcode = _context.ProductInStockExps.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
        //            if (header != null)
        //            {
        //                var logData = new
        //                {
        //                    Header = header,
        //                    Detail = detail,
        //                    DetailQrcode = detailQrcode
        //                };

        //                var listLogData = new List<object>();
        //                listLogData.Add(logData);

        //                header.LogData = JsonConvert.SerializeObject(listLogData);

        //                _context.ProdDeliveryHeaders.Update(header);
        //                _context.SaveChanges();
        //            }
        //            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public JsonResult Update([FromBody]MaterialStoreExpModelInsert obj)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var poOldTime = DateTime.Now;

        //        var objUpdate = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
        //        if (objUpdate != null)
        //        {
        //            //Xử lý list cũ trước
        //            //xóa detail
        //            var listDetail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode).ToList();
        //            listDetail.ForEach(x =>
        //            {
        //                x.IsDeleted = true;
        //                x.DeletedBy = ESEIM.AppContext.UserName;
        //                x.DeletedTime = DateTime.Now;
        //            });
        //            _context.ProdDeliveryDetails.UpdateRange(listDetail);

        //            //Trả sản phẩm vào vị trí trong bảng Mapping  
        //            //trả lại kho 
        //            //xóa bản ghi trong bảng ProductInStockExps (Với xuất theo PO)

        //            //Xuất lẻ
        //            if (string.IsNullOrEmpty(objUpdate.LotProductCode))
        //            {
        //                foreach (var item in listDetail)
        //                {
        //                    //Trả sản phẩm vào vị trí trong bảng Mapping  
        //                    var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                    if (mapping != null)
        //                    {
        //                        mapping.Quantity = mapping.Quantity + item.Quantity;
        //                        mapping.UpdatedBy = User.Identity.Name;
        //                        mapping.UpdatedTime = DateTime.Now;
        //                        _context.ProductEntityMappings.Update(mapping);
        //                    }
        //                    else
        //                    {
        //                        var mapping2 = _context.ProductEntityMappings.FirstOrDefault(x => x.Quantity == 0 && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                        if (mapping2 != null)
        //                        {
        //                            mapping2.Quantity = mapping2.Quantity + item.Quantity;
        //                            mapping2.IsDeleted = false;
        //                            mapping2.UpdatedBy = User.Identity.Name;
        //                            mapping2.UpdatedTime = DateTime.Now;
        //                            _context.ProductEntityMappings.Update(mapping2);
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode;
        //                            return Json(msg);
        //                        }
        //                    }

        //                    //Trả lại kho - Quét qua từng list QRcode (qua từng RackCode khác nhau)
        //                    var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductQrCode);
        //                    if (storeInventory != null)
        //                    {
        //                        storeInventory.Quantity = storeInventory.Quantity + item.Quantity;
        //                        _context.ProductInStocks.Update(storeInventory);
        //                    }

        //                    //Trả lại số lượng của cuộn trong bảng PROD_PACKAGE_INFO
        //                    var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.ProductCoil));
        //                    if (prodPackageInfo != null)
        //                    {
        //                        prodPackageInfo.Remain = prodPackageInfo.Remain + item.Quantity;
        //                        _context.ProdPackageReceiveds.Update(prodPackageInfo);
        //                    }
        //                }
        //            }
        //            //Xuất theo PO
        //            else
        //            {
        //                //Trả lại lượng sản phẩm còn phải xuất trong bảng PO_Product_Detail
        //                foreach (var item in listDetail)
        //                {
        //                    var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == objUpdate.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
        //                    if (poProductDetail != null)
        //                    {
        //                        poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport + item.Quantity;
        //                        _context.PoSaleProductDetails.Update(poProductDetail);
        //                    }

        //                }

        //                //Trả sản phẩm vào vị trí trong bảng Mapping  
        //                //trả lại kho và xóa bản ghi trong bảng ProductInStockExps
        //                var listProductInStockExps = _context.ProductInStockExps.Where(x => x.TicketCode == objUpdate.TicketCode).ToList();
        //                if (listProductInStockExps.Any())
        //                {
        //                    foreach (var productInStockExps in listProductInStockExps)
        //                    {
        //                        //Trả sản phẩm vào vị trí trong bảng Mapping  
        //                        var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productInStockExps.ProductQrCode) && x.RackCode.Equals(productInStockExps.RackCode));
        //                        if (mapping != null)
        //                        {
        //                            mapping.Quantity = mapping.Quantity + productInStockExps.Quantity;
        //                            mapping.UpdatedBy = User.Identity.Name;
        //                            mapping.UpdatedTime = DateTime.Now;
        //                            _context.ProductEntityMappings.Update(mapping);
        //                        }
        //                        else
        //                        {
        //                            var mapping2 = _context.ProductEntityMappings.FirstOrDefault(x => x.Quantity == 0 && x.ProductQrCode.Equals(productInStockExps.ProductQrCode) && x.RackCode.Equals(productInStockExps.RackCode));
        //                            if (mapping2 != null)
        //                            {
        //                                mapping2.Quantity = mapping2.Quantity + productInStockExps.Quantity;
        //                                mapping2.IsDeleted = false;
        //                                mapping2.UpdatedBy = User.Identity.Name;
        //                                mapping2.UpdatedTime = DateTime.Now;
        //                                _context.ProductEntityMappings.Update(mapping2);
        //                            }
        //                            else
        //                            {
        //                                msg.Error = true;
        //                                msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + productInStockExps.ProductQrCode;
        //                                return Json(msg);
        //                            }
        //                        }

        //                        //trả lại kho - Quét qua từng list QRcode (qua từng RackCode khác nhau)
        //                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == productInStockExps.ProductQrCode);
        //                        if (storeInventory != null)
        //                        {
        //                            storeInventory.Quantity = storeInventory.Quantity + productInStockExps.Quantity;
        //                            _context.ProductInStocks.Update(storeInventory);
        //                        }

        //                        //Trả lại số lượng của cuộn trong bảng PROD_PACKAGE_INFO
        //                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(productInStockExps.ProductCoil));
        //                        if (prodPackageInfo != null)
        //                        {
        //                            prodPackageInfo.Remain = prodPackageInfo.Remain + productInStockExps.Quantity;
        //                            _context.ProdPackageReceiveds.Update(prodPackageInfo);
        //                        }
        //                    }
        //                    //xóa bản ghi trong bảng ProductInStockExps
        //                    _context.ProductInStockExps.RemoveRange(listProductInStockExps);
        //                }
        //            }

        //            //Thay lượng tồn của sản phẩm từ bảng Product - Sub Product
        //            //Xử lý chung cho cả 2 dạng xuất
        //            foreach (var item in listDetail)
        //            {
        //                if (item.ProductType == "SUB_PRODUCT")
        //                {
        //                    var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
        //                    if (subProduct != null)
        //                    {
        //                        subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock + item.Quantity;
        //                        _context.SubProducts.Update(subProduct);
        //                    }
        //                }
        //                else if (item.ProductType == "FINISHED_PRODUCT")
        //                {
        //                    var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
        //                    if (product != null)
        //                    {
        //                        product.InStock = product.InStock == null ? item.Quantity : product.InStock + item.Quantity;
        //                        _context.MaterialProducts.Update(product);
        //                    }
        //                }
        //            }

        //            //Xóa bỏ lịch sử khởi tạo lại
        //            var prodPackageInfoHistorys =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketExpCode.Equals(obj.TicketCode));
        //            if (prodPackageInfoHistorys != null)
        //            {
        //                foreach (var prodPackageInfoHistory in prodPackageInfoHistorys)
        //                {
        //                    prodPackageInfoHistory.IsDeleted = true;
        //                }
        //               _context.ProdPackageDeliverys.UpdateRange(prodPackageInfoHistorys);
        //            }

        //            var oldTimeTicketCreate = objUpdate.TimeTicketCreate;
        //            //Update bảng header
        //            objUpdate.LotProductCode = obj.LotProductCode;
        //            objUpdate.TicketCode = obj.TicketCode;
        //            objUpdate.Title = obj.Title;
        //            objUpdate.StoreCode = obj.StoreCode;
        //            objUpdate.ContractCode = obj.ContractCode;
        //            objUpdate.CusCode = obj.CusCode;
        //            objUpdate.Reason = obj.Reason;
        //            objUpdate.StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "";
        //            objUpdate.CostTotal = obj.CostTotal;
        //            objUpdate.Currency = obj.Currency;
        //            objUpdate.Discount = obj.Discount;
        //            objUpdate.TaxTotal = obj.TaxTotal;
        //            objUpdate.Commission = obj.Commission;
        //            objUpdate.TotalMustPayment = obj.TotalMustPayment;
        //            objUpdate.TotalPayed = obj.TotalPayed;
        //            objUpdate.PaymentStatus = obj.Currency == "CURRENCY_VND"
        //                                    ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
        //                                    : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE";
        //            objUpdate.NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //            objUpdate.UserExport = obj.UserExport;
        //            objUpdate.Note = obj.Note;
        //            objUpdate.UserReceipt = obj.UserReceipt;
        //            objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //            objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //            objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
        //            objUpdate.UpdatedTime = DateTime.Now;

        //            _context.ProdDeliveryHeaders.Update(objUpdate);

        //            _context.SaveChanges();

        //            //Xóa dữ liệu với oldTimeTicketCreate là giá trị cũ
        //            foreach (var item in listDetail)
        //            {
        //                string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
        //                object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, objUpdate.LotProductCode, oldTimeTicketCreate };
        //                _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
        //            }

        //            //Insert list detail mới vào
        //            //Xử lý khi xuất lẻ
        //            if (obj.ListPoProduct.Count == 0)
        //            {
        //                var headerCode = string.Empty;
        //                var dateNow = DateTime.Now;

        //                var listSalePrice = _context.ProductCostHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.EffectiveDate).ToList();
        //                var salePriceApply = listSalePrice.FirstOrDefault(x => !x.IsDeleted && x.EffectiveDate <= dateNow && x.ExpiryDate >= dateNow);
        //                if (salePriceApply != null)
        //                {
        //                    headerCode = salePriceApply.HeaderCode;
        //                }
        //                else
        //                {
        //                    headerCode = listSalePrice.Where(x => dateNow >= x.ExpiryDate).FirstOrDefault().HeaderCode;
        //                }

        //                if (!string.IsNullOrEmpty(headerCode))
        //                {
        //                    foreach (var item in obj.ListProduct)
        //                    {
        //                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.ProductCoil));
        //                        if (prodPackageInfo != null)
        //                        {
        //                            var prodPackageInfoHistory = new ProdPackageInfoHistory
        //                            {
        //                                CoilCode = prodPackageInfo.CoilCode,
        //                                CoilRelative = prodPackageInfo.CoilRelative,
        //                                CreatedBy = prodPackageInfo.CreatedBy,
        //                                CreatedTime = prodPackageInfo.CreatedTime,
        //                                DeletedBy = prodPackageInfo.DeletedBy,
        //                                DeletedTime = prodPackageInfo.DeletedTime,
        //                                IsDeleted = prodPackageInfo.IsDeleted,
        //                                LineCode = prodPackageInfo.LineCode,
        //                                PackType = prodPackageInfo.PackType,
        //                                PositionInStore = prodPackageInfo.PositionInStore,
        //                                ProductCoil = prodPackageInfo.ProductCoil,
        //                                ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
        //                                ProductQrCode = prodPackageInfo.ProductQrCode,
        //                                ProductCode = prodPackageInfo.ProductCode,
        //                                ProductType = prodPackageInfo.ProductType,
        //                                ProductLot = prodPackageInfo.ProductLot,
        //                                RackCode = prodPackageInfo.RackCode,
        //                                RackPosition = prodPackageInfo.RackPosition,
        //                                Remain = (int)item.Quantity,
        //                                Size = (int)item.Quantity,
        //                                TicketCode = prodPackageInfo.TicketCode,
        //                                TicketExpCode = obj.TicketCode,
        //                                UpdatedBy = prodPackageInfo.UpdatedBy,
        //                                UpdatedTime = prodPackageInfo.UpdatedTime,
        //                            };

        //                           _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);


        //                            prodPackageInfo.Remain = prodPackageInfo.Remain > item.Quantity ? prodPackageInfo.Remain - item.Quantity : 0;
        //                            _context.ProdPackageReceiveds.Update(prodPackageInfo);
        //                        }

        //                        decimal salePrice = 0;
        //                        var productCostDetail = _context.ProductCostDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(item.ProductCode) && x.HeaderCode.Equals(headerCode));
        //                        if (productCostDetail != null)
        //                        {
        //                            if (productCostDetail.PriceCostDefault != null)
        //                                salePrice = (decimal)productCostDetail.PriceCostDefault;
        //                        }

        //                        //insert bảng detail
        //                        var objNewDetail = new ProdDeliveryDetail
        //                        {
        //                            LotProductCode = obj.LotProductCode,
        //                            TicketCode = obj.TicketCode,
        //                            Currency = obj.Currency,

        //                            ProductCode = item.ProductCode,
        //                            ProductType = item.ProductType,
        //                            ProductQrCode = item.ProductQrCode,
        //                            Quantity = item.Quantity,
        //                            Unit = item.Unit,
        //                            SalePrice = salePrice,
        //                            TaxRate = item.TaxRate,
        //                            Discount = item.Discount,
        //                            Commission = item.Commission,
        //                            RackCode = item.RackCode,

        //                            ProductCoil = item.ProductCoil,
        //                            CreatedBy = ESEIM.AppContext.UserName,
        //                            CreatedTime = DateTime.Now,
        //                        };
        //                        _context.ProdDeliveryDetails.Add(objNewDetail);

        //                        //Bỏ sản phẩm ra khỏi bảng Kho
        //                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
        //                        if (storeInventory != null)
        //                        {
        //                            storeInventory.Quantity = storeInventory.Quantity - item.Quantity;
        //                            _context.ProductInStocks.Update(storeInventory);
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_IN_WARE_HOURE"));
        //                            return Json(msg);
        //                        }

        //                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
        //                        var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                        if (mapping != null)
        //                        {
        //                            mapping.Quantity = mapping.Quantity - item.Quantity;
        //                            //if (mapping.Quantity == 0)
        //                            //{
        //                            //    mapping.IsDeleted = true;
        //                            //}
        //                            mapping.UpdatedBy = User.Identity.Name;
        //                            mapping.UpdatedTime = DateTime.Now;
        //                            _context.ProductEntityMappings.Update(mapping);
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                            return Json(msg);
        //                        }

        //                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping_Log
        //                        var mappingLogs = _context.ProductEntityMappingLogs.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && x.RackCode.Equals(item.RackCode));
        //                        if (mappingLogs != null)
        //                        {
        //                            var quantity = item.Quantity;
        //                            foreach (var log in mappingLogs)
        //                            {
        //                                if (log.Quantity > 0 && quantity > 0)
        //                                {
        //                                    if (log.Quantity > quantity)
        //                                    {
        //                                        log.Quantity = log.Quantity - quantity;
        //                                        quantity = 0;
        //                                    }
        //                                    else
        //                                    {
        //                                        quantity = quantity - (decimal)log.Quantity;
        //                                        log.Quantity = 0;
        //                                    }

        //                                    //if (mapping.Quantity == 0)
        //                                    //{
        //                                    //    mapping.IsDeleted = true;
        //                                    //}
        //                                    log.UpdatedBy = User.Identity.Name;
        //                                    log.UpdatedTime = DateTime.Now;
        //                                    _context.ProductEntityMappingLogs.Update(log);
        //                                }
        //                            }
        //                        }
        //                        else
        //                        {
        //                            msg.Error = true;
        //                            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                            return Json(msg);
        //                        }

        //                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
        //                        if (item.ProductType == "SUB_PRODUCT")
        //                        {
        //                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
        //                            if (subProduct != null)
        //                            {
        //                                subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock - item.Quantity;
        //                                _context.SubProducts.Update(subProduct);
        //                            }
        //                        }
        //                        else if (item.ProductType == "FINISHED_PRODUCT")
        //                        {
        //                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
        //                            if (product != null)
        //                            {
        //                                product.InStock = product.InStock == null ? item.Quantity : product.InStock - item.Quantity;
        //                                _context.MaterialProducts.Update(product);
        //                            }
        //                        }
        //                    }
        //                }
        //                else
        //                {
        //                    msg.Error = true;
        //                    msg.Title = "Không có bảng giá. Vui lòng tạo bảng giá";
        //                    return Json(msg);
        //                }
        //            }
        //            //Xử lý khi xuất theo PO
        //            //Lấy ra đủ số lượng bất kỳ trong kho - ProductInStock => Lấy được ProductQrCode
        //            //Sau đó mới insert vào bảng Detail của Export
        //            else
        //            {
        //                foreach (var item in obj.ListPoProduct)
        //                {
        //                    foreach (var itemCoil in item.ListProductInRack)
        //                    {
        //                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(itemCoil.ProductCoil));
        //                        if (prodPackageInfo != null)
        //                        {
        //                            prodPackageInfo.Remain = prodPackageInfo.Remain > itemCoil.Quantity ? prodPackageInfo.Remain - itemCoil.Quantity : 0;
        //                            _context.ProdPackageReceiveds.Update(prodPackageInfo);

        //                            var prodPackageInfoHistory = new ProdPackageInfoHistory
        //                            {
        //                                CoilCode = prodPackageInfo.CoilCode,
        //                                CoilRelative = prodPackageInfo.CoilRelative,
        //                                CreatedBy = prodPackageInfo.CreatedBy,
        //                                CreatedTime = prodPackageInfo.CreatedTime,
        //                                DeletedBy = prodPackageInfo.DeletedBy,
        //                                DeletedTime = prodPackageInfo.DeletedTime,
        //                                IsDeleted = prodPackageInfo.IsDeleted,
        //                                LineCode = prodPackageInfo.LineCode,
        //                                PackType = prodPackageInfo.PackType,
        //                                PositionInStore = prodPackageInfo.PositionInStore,
        //                                ProductCoil = prodPackageInfo.ProductCoil,
        //                                ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
        //                                ProductQrCode = prodPackageInfo.ProductQrCode,
        //                                ProductCode = prodPackageInfo.ProductCode,
        //                                ProductType = prodPackageInfo.ProductType,
        //                                ProductLot = prodPackageInfo.ProductLot,
        //                                RackCode = prodPackageInfo.RackCode,
        //                                RackPosition = prodPackageInfo.RackPosition,
        //                                Remain = (int)itemCoil.Quantity,
        //                                Size = (int)itemCoil.Quantity,
        //                                TicketCode = prodPackageInfo.TicketCode,
        //                                TicketExpCode = obj.TicketCode,
        //                                UpdatedBy = prodPackageInfo.UpdatedBy,
        //                                UpdatedTime = prodPackageInfo.UpdatedTime,
        //                            };

        //                           _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);
        //                        }
        //                    }

        //                    //Insert bảng detail - mỗi sản phẩm chỉ 1 bản ghi (Ko nhập QrCode nữa)
        //                    var objNewDetail = new ProdDeliveryDetail
        //                    {
        //                        LotProductCode = obj.LotProductCode,
        //                        TicketCode = obj.TicketCode,
        //                        Currency = obj.Currency,

        //                        ProductCode = item.ProductCode,
        //                        ProductType = item.ProductType,
        //                        Quantity = item.Quantity,
        //                        Unit = item.Unit,

        //                        ProductCoil = item.ProductCoil,
        //                        CreatedBy = ESEIM.AppContext.UserName,
        //                        CreatedTime = DateTime.Now,
        //                    };
        //                    _context.ProdDeliveryDetails.Add(objNewDetail);

        //                    ////Bỏ sản phẩm ra khỏi bảng Kho
        //                    ////Phương án cũ => Lấy bất kỳ
        //                    //var baseQuantity = item.Quantity;
        //                    //var listStoreInventory = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == obj.StoreCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType).ToList();
        //                    //foreach (var itemStock in listStoreInventory)
        //                    //{
        //                    //    if (baseQuantity <= itemStock.Quantity)
        //                    //    {
        //                    //        itemStock.Quantity = itemStock.Quantity - baseQuantity;
        //                    //        _context.ProductInStocks.Update(itemStock);

        //                    //        //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                    //        var objProductInStockExp = new ProductInStockExp
        //                    //        {
        //                    //            TicketCode = obj.TicketCode,
        //                    //            ProductCode = itemStock.ProductCode,
        //                    //            ProductType = itemStock.ProductType,
        //                    //            ProductQrCode = itemStock.ProductQrCode,
        //                    //            Quantity = baseQuantity,
        //                    //        };
        //                    //        _context.ProductInStockExps.Add(objProductInStockExp);

        //                    //        ////Phần xử lý mapping không xử lý nữa

        //                    //        break;
        //                    //    }
        //                    //    else
        //                    //    {
        //                    //        baseQuantity = baseQuantity - itemStock.Quantity;
        //                    //        itemStock.Quantity = 0;
        //                    //        _context.ProductInStocks.Update(itemStock);

        //                    //        //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                    //        var objProductInStockExp = new ProductInStockExp
        //                    //        {
        //                    //            TicketCode = obj.TicketCode,
        //                    //            ProductCode = itemStock.ProductCode,
        //                    //            ProductType = itemStock.ProductType,
        //                    //            ProductQrCode = itemStock.ProductQrCode,
        //                    //            Quantity = itemStock.Quantity,
        //                    //        };
        //                    //        _context.ProductInStockExps.Add(objProductInStockExp);

        //                    //        ////Phần xử lý mapping không xử lý nữa
        //                    //    }
        //                    //}

        //                    if (item.Quantity > 0)
        //                    {
        //                        //Bỏ sản phẩm ra khỏi bảng Kho
        //                        if (item.ListProductInRack != null && item.ListProductInRack.Any())
        //                        {
        //                            foreach (var itemStock in item.ListProductInRack)
        //                            {
        //                                var productInStocks = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.StoreCode.Equals(obj.StoreCode) && x.ProductQrCode.Equals(itemStock.ProductQrCode));
        //                                if (productInStocks != null)
        //                                {
        //                                    productInStocks.Quantity = productInStocks.Quantity > itemStock.Quantity ? productInStocks.Quantity - itemStock.Quantity : 0;
        //                                    _context.ProductInStocks.Update(productInStocks);

        //                                    //Phần này insert bảng lưu thông tin xuất kho của từng QrCode theo từng phiếu xuất
        //                                    var objProductInStockExp = new ProductInStockExp
        //                                    {
        //                                        TicketCode = obj.TicketCode,
        //                                        ProductCode = productInStocks.ProductCode,
        //                                        ProductType = productInStocks.ProductType,
        //                                        ProductQrCode = productInStocks.ProductQrCode,
        //                                        Quantity = itemStock.Quantity,
        //                                        RackCode = itemStock.RackCode,
        //                                        ProductCoil = itemStock.ProductCoil,
        //                                    };
        //                                    _context.ProductInStockExps.Add(objProductInStockExp);
        //                                }

        //                                //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
        //                                var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(itemStock.ProductQrCode) && x.RackCode.Equals(itemStock.RackCode));
        //                                if (mapping != null)
        //                                {
        //                                    mapping.Quantity = mapping.Quantity - itemStock.Quantity;
        //                                    _context.ProductEntityMappings.Update(mapping);
        //                                }

        //                                //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping_Log
        //                                var mappingLogs = _context.ProductEntityMappingLogs.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(itemStock.ProductQrCode) && x.RackCode.Equals(itemStock.RackCode));
        //                                if (mappingLogs != null)
        //                                {
        //                                    var quantity = itemStock.Quantity;
        //                                    foreach (var log in mappingLogs)
        //                                    {
        //                                        if (log.Quantity > 0 && quantity > 0)
        //                                        {
        //                                            if (log.Quantity > quantity)
        //                                            {
        //                                                log.Quantity = log.Quantity - quantity;
        //                                                quantity = 0;
        //                                            }
        //                                            else
        //                                            {
        //                                                quantity = quantity - (decimal)log.Quantity;
        //                                                log.Quantity = 0;
        //                                            }

        //                                            //if (mapping.Quantity == 0)
        //                                            //{
        //                                            //    mapping.IsDeleted = true;
        //                                            //}
        //                                            log.UpdatedBy = User.Identity.Name;
        //                                            log.UpdatedTime = DateTime.Now;
        //                                            _context.ProductEntityMappingLogs.Update(log);
        //                                        }
        //                                    }
        //                                }
        //                                else
        //                                {
        //                                    msg.Error = true;
        //                                    msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_NO_SEARCH_PRODUCT")) + item.ProductQrCode + String.Format(CommonUtil.ResourceValue("MES_MSG_ON_LOCATION")) + item.RackName;
        //                                    return Json(msg);
        //                                }
        //                            }
        //                        }

        //                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
        //                        if (item.ProductType == "SUB_PRODUCT")
        //                        {
        //                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
        //                            if (subProduct != null)
        //                            {
        //                                subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock - item.Quantity;
        //                                _context.SubProducts.Update(subProduct);
        //                            }
        //                        }
        //                        else if (item.ProductType == "FINISHED_PRODUCT")
        //                        {
        //                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
        //                            if (product != null)
        //                            {
        //                                product.InStock = product.InStock == null ? item.Quantity : product.InStock - item.Quantity;
        //                                _context.MaterialProducts.Update(product);
        //                            }
        //                        }

        //                        //Giảm lượng sản phẩm còn phải xuất trong bảng PO_Product_Detail
        //                        var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == obj.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
        //                        if (poProductDetail != null)
        //                        {
        //                            poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport > item.Quantity ? poProductDetail.QuantityNeedExport - item.Quantity : 0;
        //                            _context.PoSaleProductDetails.Update(poProductDetail);
        //                        }
        //                    }
        //                }
        //            }

        //            _context.SaveChanges();
        //            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));

        //            if (obj.ListPoProduct.Count == 0)
        //            {
        //                //export lẻ
        //                foreach (var item in obj.ListProduct)
        //                {
        //                    string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
        //                    object[] val = new object[] { item.ProductCode, 0, item.Quantity, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate };
        //                    _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
        //                }
        //            }
        //            else
        //            {
        //                //export PO CUS
        //                foreach (var item in obj.ListPoProduct)
        //                {
        //                    string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
        //                    object[] val = new object[] { item.ProductCode, 0, item.Quantity, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate };
        //                    _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
        //                }
        //            }


        //            //Thêm log dữ liệu
        //            var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
        //            var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
        //            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
        //            var detailQrcode = _context.ProductInStockExps.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
        //            if (header != null)
        //            {
        //                var logData = new
        //                {
        //                    Header = header,
        //                    Detail = detail,
        //                    DetailQrcode = detailQrcode
        //                };
        //                var listLogData = new List<object>();

        //                if (!string.IsNullOrEmpty(header.LogData))
        //                {
        //                    listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
        //                    logData.Header.LogData = null;
        //                    listLogData.Add(logData);
        //                    header.LogData = JsonConvert.SerializeObject(listLogData);

        //                    _context.ProdDeliveryHeaders.Update(header);
        //                    _context.SaveChanges();
        //                }
        //                else
        //                {
        //                    listLogData.Add(logData);

        //                    header.LogData = JsonConvert.SerializeObject(listLogData);

        //                    _context.ProdDeliveryHeaders.Update(header);
        //                    _context.SaveChanges();
        //                }
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_CODE_EXITS"));
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
        //    }
        //    return Json(msg);
        //}
        #endregion

        [HttpPost]
        public JsonResult Insert([FromBody]MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangeContract = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Xóa bỏ lịch sử khởi tạo lại
                    var prodPackageInfoHistorys =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketExpCode.Equals(obj.TicketCode));
                    if (prodPackageInfoHistorys != null)
                    {
                        foreach (var prodPackageInfoHistory in prodPackageInfoHistorys)
                        {
                            prodPackageInfoHistory.IsDeleted = true;
                        }
                       _context.ProdPackageDeliverys.UpdateRange(prodPackageInfoHistorys);
                    }

                    //Insert bảng header
                    var objNew = new ProdDeliveryHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        ContractCode = obj.ContractCode,
                        CusCode = obj.CusCode,
                        Reason = obj.Reason,
                        StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "",
                        CostTotal = obj.CostTotal,
                        Currency = obj.Currency,
                        Discount = obj.Discount,
                        TaxTotal = obj.TaxTotal,
                        Commission = obj.Commission,
                        TotalMustPayment = obj.TotalMustPayment,
                        TotalPayed = obj.TotalPayed,
                        PaymentStatus = obj.Currency == "CURRENCY_VND"
                                                ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
                                                : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE",
                        NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        UserExport = obj.UserExport,
                        Note = obj.Note,
                        UserReceipt = obj.UserReceipt,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,

                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.ProdDeliveryHeaders.Add(objNew);

                    //Xử lý khi xuất lẻ
                    if (obj.ListPoProduct.Count == 0)
                    {

                    }
                    //Xử lý khi xuất theo PO  ==> Chú ý: Phần chi tiết của xuất kho theo PO xử lý trực tiếp trên DB khi thêm theo Cuộn/Thùng - Chỉ thêm list Detail ở ngoài với Quantity = 0
                    else
                    {
                        foreach (var item in obj.ListPoProduct)
                        {
                            //Insert bảng detail - mỗi sản phẩm chỉ 1 bản ghi (Ko nhập QrCode nữa)
                            var objNewDetail = new ProdDeliveryDetail
                            {
                                LotProductCode = obj.LotProductCode,
                                TicketCode = obj.TicketCode,
                                Currency = obj.Currency,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                Quantity = 0,
                                Unit = item.Unit,

                                ProductCoil = item.ProductCoil,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                            };
                            _context.ProdDeliveryDetails.Add(objNewDetail);
                        }
                    }

                    _context.SaveChanges();

                    if (obj.ListPoProduct.Count == 0)
                    {
                        ////export lẻ
                        //foreach (var item in obj.ListProduct)
                        //{
                        //    string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        //    object[] val = new object[] { item.ProductCode, item.Quantity, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
                        //    _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        //}
                    }
                    else
                    {
                        //export PO CUS
                        foreach (var item in obj.ListPoProduct)
                        {
                            string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { item.ProductCode, 0, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
                            _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        }
                    }

                    //Thêm log dữ liệu
                    var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory =_context.ProdPackageDeliverys.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProdDeliveryHeaders.Update(header);
                        _context.SaveChanges();
                    }
                    msg.ID = header.Id;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);


                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_FAILED"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]MaterialStoreExpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;

                var objUpdate = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    var oldTimeTicketCreate = objUpdate.TimeTicketCreate;
                    var oldLotProductCode = objUpdate.LotProductCode;
                    //Update bảng header
                    objUpdate.LotProductCode = obj.LotProductCode;
                    objUpdate.TicketCode = obj.TicketCode;
                    objUpdate.Title = obj.Title;
                    objUpdate.StoreCode = obj.StoreCode;
                    objUpdate.ContractCode = obj.ContractCode;
                    objUpdate.CusCode = obj.CusCode;
                    objUpdate.Reason = obj.Reason;
                    objUpdate.StoreCodeReceipt = obj.Reason == "EXP_TO_MOVE_STORE" ? obj.StoreCodeReceipt : "";
                    objUpdate.CostTotal = obj.CostTotal;
                    objUpdate.Currency = obj.Currency;
                    objUpdate.Discount = obj.Discount;
                    objUpdate.TaxTotal = obj.TaxTotal;
                    objUpdate.Commission = obj.Commission;
                    objUpdate.TotalMustPayment = obj.TotalMustPayment;
                    objUpdate.TotalPayed = obj.TotalPayed;
                    objUpdate.PaymentStatus = obj.Currency == "CURRENCY_VND"
                                            ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE"
                                            : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "EXP_PAYMENT_STATUS_DEBIT" : "EXP_PAYMENT_STATUS_DONE";
                    objUpdate.NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    objUpdate.UserExport = obj.UserExport;
                    objUpdate.Note = obj.Note;
                    objUpdate.UserReceipt = obj.UserReceipt;
                    objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
                    objUpdate.UpdatedTime = DateTime.Now;

                    _context.ProdDeliveryHeaders.Update(objUpdate);

                    _context.SaveChanges();
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);

                    //Update dữ liệu bảng dự báo - chỉ sửa thời gian
                    var listDetail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode).ToList();
                    foreach (var item in listDetail)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { item.ProductCode, 0, 0, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }

                    //Thêm log dữ liệu
                    var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các ProdPackageInfoHistorys
                    var detailInfoHistory =_context.ProdPackageDeliverys.Where(x => x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailInfoHistory = detailInfoHistory
                        };
                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdDeliveryHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdDeliveryHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_CODE_EXITS"));
                    msg.Title = _stringLocalizer["MES_MSG_CODE_EXITS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProdDeliveryHeaders.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_SHIPMENT"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MES_TITLE_INFORMATION_SHIPMENT"]);
                }
                else
                {
                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProdDeliveryHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                    });
                    _context.ProdDeliveryDetails.UpdateRange(listDetail);

                    //Xuất lẻ
                    if (string.IsNullOrEmpty(data.LotProductCode))
                    {
                        //xóa detail ProdPackageInfoHistorys
                        var listProdPackageInfoHistoryUpdate =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                        listProdPackageInfoHistoryUpdate.ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.DeletedBy = ESEIM.AppContext.UserName;
                            x.DeletedTime = DateTime.Now;
                        });
                       _context.ProdPackageDeliverys.UpdateRange(listProdPackageInfoHistoryUpdate);

                        foreach (var item in listProdPackageInfoHistoryUpdate)
                        {
                            var quantity = item.Size == null ? 0 : (decimal)item.Size;
                            //Trả lại số lượng của cuộn trong bảng PROD_PACKAGE_INFO
                            var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.ProductCoil));
                            if (prodPackageInfo != null)
                            {
                                prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                                _context.ProdPackageReceiveds.Update(prodPackageInfo);
                            }

                            //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                            var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                            if (mapping != null)
                            {
                                mapping.Quantity = mapping.Quantity + quantity;
                                mapping.UpdatedBy = User.Identity.Name;
                                mapping.UpdatedTime = DateTime.Now;
                                _context.ProductEntityMappings.Update(mapping);

                                //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                if (storeInventory != null)
                                {
                                    storeInventory.Quantity = storeInventory.Quantity + quantity;
                                    _context.ProductInStocks.Update(storeInventory);
                                }
                            }
                        }
                    }
                    //Xuất theo PO
                    else
                    {
                        //Trả lại lượng sản phẩm còn phải xuất trong bảng PO_Product_Detail
                        foreach (var item in listDetail)
                        {
                            var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == data.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport + item.Quantity;
                                _context.PoSaleProductDetails.Update(poProductDetail);
                            }
                        }

                        //Trả sản phẩm vào vị trí trong bảng Mapping  
                        //trả lại kho và xóa bản ghi trong bảng ProdPackageInfoHistorys
                        var listProdPackageInfoHistory =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketExpCode == data.TicketCode).ToList();
                        if (listProdPackageInfoHistory.Any())
                        {
                            foreach (var prodPackageInfoHistory in listProdPackageInfoHistory)
                            {
                                //Update lại dữ liệu bảng ProdPackageInfos
                                var quantity = prodPackageInfoHistory.Size == null ? 0 : (decimal)prodPackageInfoHistory.Size;
                                var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(prodPackageInfoHistory.CoilCode));
                                if (prodPackageInfo != null)
                                {
                                    prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                                    _context.ProdPackageReceiveds.Update(prodPackageInfo);
                                }

                                //Xóa dữ liệu bảng ProdPackageInfoHistorys
                                prodPackageInfoHistory.IsDeleted = true;
                                prodPackageInfoHistory.DeletedBy = User.Identity.Name;
                                prodPackageInfoHistory.DeletedTime = DateTime.Now;
                               _context.ProdPackageDeliverys.Update(prodPackageInfoHistory);

                                //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                                var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfoHistory.ProductQrCode) && x.RackCode.Equals(prodPackageInfoHistory.RackCode));
                                if (mapping != null)
                                {
                                    mapping.Quantity = mapping.Quantity + quantity;
                                    mapping.UpdatedBy = User.Identity.Name;
                                    mapping.UpdatedTime = DateTime.Now;
                                    _context.ProductEntityMappings.Update(mapping);

                                    //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                    var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfoHistory.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                    if (storeInventory != null)
                                    {
                                        storeInventory.Quantity = storeInventory.Quantity + quantity;
                                        _context.ProductInStocks.Update(storeInventory);
                                    }
                                }
                            }
                        }
                    }

                    //Thay lượng tồn của sản phẩm từ bảng Product - Sub Product
                    //Xử lý chung cho cả 2 dạng xuất
                    foreach (var item in listDetail)
                    {
                        if (item.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == item.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null ? item.Quantity : subProduct.InStock + item.Quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (item.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null ? item.Quantity : product.InStock + item.Quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }
                    }

                    _context.SaveChanges();
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MES_MSG_DELETE_ERRO_SUCCESS"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                    foreach (var item in listDetail)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, item.LotProductCode, data.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }

                    //Thêm log dữ liệu
                    var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode));
                    var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                    var detailQrcode =_context.ProdPackageDeliverys.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail,
                            DetailQrcode = detailQrcode
                        };
                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdDeliveryHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdDeliveryHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_EXPSTORE"));
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["MES_TITLE_INFORMATION_EXPSTORE"]);
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetUpdateLog(string ticketCode)
        {
            var msg = new JMessage();
            var data = _context.ProdDeliveryHeaders.FirstOrDefault(x => x.TicketCode == ticketCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult CreateTicketCode(string type)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ticketCode = string.Empty;
                var monthNow = DateTime.Now.Month;
                var yearNow = DateTime.Now.Year;

                switch (type)
                {
                    case "ODD":
                        var expODD = _context.ProdDeliveryHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noODD = 1;
                        if (expODD.Count > 0)
                            noODD = noODD + expODD.Count;
                        ticketCode = string.Format("EXP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                        break;
                    case "PO":
                        var expPO = _context.ProdDeliveryHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noPO = 1;
                        if (expPO.Count > 0)
                            noPO = noPO + expPO.Count;
                        ticketCode = string.Format("EXP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
                        break;
                }

                mess.Object = ticketCode;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcelProduct(string ticketCode)
        {
            var expHeader = _context.ProdDeliveryHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
            {
                x.LotProductCode,
                x.TicketCode,
                x.Title,
                x.StoreCode,
                x.ContractCode,
                x.CusCode,
                Reason = _context.CommonSettings.FirstOrDefault(p => p.CodeSet.Equals(x.Reason)) != null ? _context.CommonSettings.FirstOrDefault(p => p.CodeSet.Equals(x.Reason)).ValueSet : "",
                x.StoreCodeReceipt,
                x.CostTotal,
                x.Currency,
                x.Discount,
                x.TaxTotal,
                x.Commission,
                x.TotalMustPayment,
                x.TotalPayed,
                x.PaymentStatus,
                NextTimePayment = x.NextTimePayment.HasValue ? x.NextTimePayment.Value.ToString("dd/MM/yyyy") : "",
                x.UserExport,
                x.Note,
                x.UserReceipt,
                InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                Branch = _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)) != null ? _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)).Branch.OrgName : "",
                CreatedTime = x.TimeTicketCreate.HasValue ? "Ngày " + x.TimeTicketCreate.Value.Day + " tháng " + x.TimeTicketCreate.Value.Month + " năm " + x.TimeTicketCreate.Value.Year : "",
                StoreName = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_Name : "",
                StoreAddress = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_ADDR_Text : ""
            }).FirstOrDefault();

            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var listProduct = (from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && string.IsNullOrEmpty(y.LotProductCode))
                               join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                               join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                               join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                               join c in _context.EDMSLines on b.LineCode equals c.LineCode
                               join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                               join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductCode
                               join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                               join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                               from e2 in e1.DefaultIfEmpty()
                               let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                               orderby b1.ProductName
                               select new
                               {
                                   ProductCode = a1.ProductCode,
                                   ProductType = "FINISHED_PRODUCT",
                                   ProductName = "Thành phẩm _ " + b1.ProductName,
                                   ProductQrCode = a1.ProductQrCode,
                                   sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                   Unit = a1.Unit,
                                   UnitName = c1.ValueSet,

                                   Quantity = g.Quantity,
                                   RackCode = a.RackCode,
                                   RackName = name,
                                   ProductCoil = g.ProductCoil,
                                   SalePrice = g.SalePrice,
                                   e2.SupCode,
                                   e2.SupName
                               })
                             .Concat(from g in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && string.IsNullOrEmpty(y.LotProductCode))
                                     join a1 in _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on g.ProductQrCode equals a1.ProductQrCode
                                     join a in _context.ProductEntityMappings.Where(y => !y.IsDeleted) on new { g.ProductQrCode, g.RackCode } equals new { a.ProductQrCode, a.RackCode }
                                     join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                                     join c in _context.EDMSLines on b.LineCode equals c.LineCode
                                     join d1 in _context.EDMSFloors on c.FloorCode equals d1.FloorCode
                                     join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a1.ProductCode equals b1.ProductQrCode
                                     join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                     join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a1.Unit equals c1.CodeSet
                                     join e in listSupplierGroup on a1.ProductCode equals e.ProductCode into e1
                                     from e2 in e1.DefaultIfEmpty()
                                     let name = d1.FloorName + " - " + c.L_Text + " - " + b.RackName
                                     orderby b1.AttributeName
                                     select new
                                     {
                                         ProductCode = a1.ProductCode,
                                         ProductType = "SUB_PRODUCT",
                                         ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                         ProductQrCode = a1.ProductQrCode,
                                         sProductQrCode = CommonUtil.GenerateQRCode(a1.ProductQrCode),
                                         Unit = a1.Unit,
                                         UnitName = c1.ValueSet,
                                         Quantity = g.Quantity,
                                         RackCode = a.RackCode,
                                         RackName = name,
                                         ProductCoil = g.ProductCoil,
                                         SalePrice = g.SalePrice,
                                         e2.SupCode,
                                         e2.SupName
                                     });
            var listPoProduct = (from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT" && y.TicketCode == ticketCode)
                                 join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                 join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductCode
                                 //join e1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.LotProductCode equals e1.ContractCode into e2
                                 //from e in e2.DefaultIfEmpty()
                                 join c in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                 from c1 in c2.DefaultIfEmpty()
                                 join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                 from e2 in e1.DefaultIfEmpty()
                                     //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                 let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                 let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == expHeader.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                 orderby b1.ProductName
                                 select new
                                 {
                                     ProductCode = a.ProductCode,
                                     ProductName = "Thành phẩm _ " + b1.ProductName,
                                     ProductType = "FINISHED_PRODUCT",
                                     //ProductQrCode = productQrCode,
                                     //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                     Unit = b1.Unit,
                                     UnitName = (c1 != null ? c1.ValueSet : ""),
                                     QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                     Quantity = a.Quantity,
                                     ProductCoil = a.ProductCoil,
                                     SalePrice = a.SalePrice,
                                     //QuantityInStockTotal = (decimal)b1.InStock,
                                     QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                     QuantityInStock = productInStock != null ? productInStock : 0,
                                     QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                     ListProductInRack = (from a3 in _context.ProdPackageDeliverys.Where(y => y.TicketCode == ticketCode && y.ProductCode == a.ProductCode && y.ProductType == "FINISHED_PRODUCT")
                                                          join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                                          join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                                          join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                                          join f3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductCode
                                                          join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                                          let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                                          orderby f3.ProductName
                                                          select new
                                                          {
                                                              ProductCode = a3.ProductCode,
                                                              ProductType = "FINISHED_PRODUCT",
                                                              ProductName = "Thành phẩm _ " + f3.ProductName,
                                                              ProductQrCode = a3.ProductQrCode,
                                                              sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                                              Unit = f3.Unit,
                                                              UnitName = g3.ValueSet,

                                                              Quantity = a3.Size,
                                                              RackCode = a3.RackCode,
                                                              RackName = name,
                                                              ProductCoil = a3.CoilCode,
                                                              a3.ProductLot,
                                                          }),
                                     e2.SupCode,
                                     e2.SupName
                                 })
                           .Concat(from a in _context.ProdDeliveryDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT" && y.TicketCode == ticketCode)
                                   join a1 in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on new { ContractCode = a.LotProductCode, a.ProductCode, a.ProductType } equals new { a1.ContractCode, a1.ProductCode, a1.ProductType }
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                   join d in _context.MaterialProducts.Where(y => !y.IsDeleted) on b1.ProductCode equals d.ProductCode
                                   join c1 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(y => !y.IsDeleted && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                   let productInStock = _context.ProductInStocks.Where(y => !y.IsDeleted && y.StoreCode == expHeader.StoreCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT").Sum(y => y.Quantity) + a.Quantity
                                   orderby b1.AttributeName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a1.QuantityNeedExport + a.Quantity,
                                       Quantity = a.Quantity,
                                       ProductCoil = a.ProductCoil,
                                       SalePrice = a.SalePrice,
                                       //QuantityInStockTotal = (decimal)b1.InStock,
                                       QuantityInStockTotal = productInStockTotal != null ? productInStockTotal : 0,
                                       QuantityInStock = productInStock != null ? productInStock : 0,
                                       QuantityMax = productInStock != null ? Math.Min(productInStock, a1.QuantityNeedExport + a.Quantity) : Math.Min(0, a1.QuantityNeedExport + a.Quantity),
                                       ListProductInRack = (from a3 in _context.ProdPackageDeliverys.Where(y => y.TicketCode == ticketCode && y.ProductCode == a.ProductCode && y.ProductType == "SUB_PRODUCT")
                                                            join c3 in _context.EDMSRacks on a3.RackCode equals c3.RackCode
                                                            join d3 in _context.EDMSLines on c3.LineCode equals d3.LineCode
                                                            join e3 in _context.EDMSFloors on d3.FloorCode equals e3.FloorCode
                                                            join f3 in _context.SubProducts.Where(y => !y.IsDeleted) on a3.ProductCode equals f3.ProductQrCode
                                                            join i3 in _context.MaterialProducts.Where(y => !y.IsDeleted) on f3.ProductCode equals i3.ProductCode
                                                            join g3 in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f3.Unit equals g3.CodeSet
                                                            let name = e3.FloorName + " - " + d3.L_Text + " - " + c3.RackName
                                                            orderby f3.AttributeName
                                                            select new
                                                            {
                                                                ProductCode = a3.ProductCode,
                                                                ProductType = "SUB_PRODUCT",
                                                                ProductName = i3.ProductCode + " _ " + f3.AttributeName,
                                                                ProductQrCode = a3.ProductQrCode,
                                                                sProductQrCode = CommonUtil.GenerateQRCode(a3.ProductQrCode),
                                                                Unit = f3.Unit,
                                                                UnitName = g3.ValueSet,

                                                                Quantity = a3.Size,
                                                                RackCode = a3.RackCode,
                                                                RackName = name,
                                                                ProductCoil = a3.CoilCode,
                                                                a3.ProductLot,
                                                            }),
                                       e2.SupCode,
                                       e2.SupName
                                   });

            var data = listProduct.ToList();
            var dataPo = listPoProduct.ToList();

            var listExport = new List<ProdDeliveryDetailExport>();
            var no = 1;
            if (data.Count > 0)
            {
                foreach (var item in data)
                {
                    var itemExport = new ProdDeliveryDetailExport();
                    itemExport.No = no;
                    itemExport.ProductName = item.ProductName;
                    itemExport.ProductCode = item.ProductCode;
                    itemExport.Unit = item.UnitName;
                    itemExport.QuantityPO = item.Quantity;
                    itemExport.Quantity = item.Quantity;
                    itemExport.SalePrice = item.SalePrice;
                    itemExport.TotalAmount = item.SalePrice * item.Quantity;

                    no = no + 1;
                    listExport.Add(itemExport);
                }
            }

            if (dataPo.Count > 0)
            {
                foreach (var item in dataPo)
                {
                    var itemExport = new ProdDeliveryDetailExport();
                    itemExport.No = no;
                    itemExport.ProductName = item.ProductName;
                    itemExport.ProductCode = item.ProductCode;
                    itemExport.Unit = item.UnitName;
                    itemExport.QuantityPO = item.Quantity;
                    itemExport.Quantity = item.Quantity;
                    itemExport.SalePrice = item.SalePrice;
                    itemExport.TotalAmount = item.SalePrice * item.Quantity;

                    no = no + 1;
                    listExport.Add(itemExport);
                }
            }

            if (expHeader != null)
            {

            }

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                var pathTemplate = Path.Combine(_hostingEnvironment.WebRootPath, "files\\ExportStore_Template.xlsx");

                FileStream fileStream = new FileStream(pathTemplate, FileMode.Open, FileAccess.ReadWrite);

                IWorkbook workbook = application.Workbooks.Open(fileStream);
                IWorksheet worksheet = workbook.Worksheets[0];
                worksheet.InsertRow(14, listExport.Count, ExcelInsertOptions.FormatAsAfter);

                //Create Template Marker Processor
                ITemplateMarkersProcessor marker = workbook.CreateTemplateMarkersProcessor();

                IStyle bodyStyle = workbook.Styles.Add("BodyStyle");
                bodyStyle.BeginUpdate();
                //bodyStyle.Color = Color.FromArgb(239, 243, 247);
                bodyStyle.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                bodyStyle.HorizontalAlignment = ExcelHAlign.HAlignCenter;
                bodyStyle.VerticalAlignment = ExcelVAlign.VAlignCenter;
                bodyStyle.WrapText = true;
                bodyStyle.EndUpdate();

                //Add collections to the marker variables where the name should match with input template
                marker.AddVariable("listProduct", listExport);
                marker.AddVariable("expHeader", expHeader);

                //Process the markers in the template
                marker.ApplyMarkers();


                int row = 14;
                int totalRow = row + listExport.Count();

                worksheet.Range["A15" + ":H" + totalRow].CellStyle = bodyStyle;
                worksheet.UsedRange.AutofitColumns();
                worksheet.UsedRange.AutofitRows();
                worksheet.ImportData(listExport, 14, 1, false);

                worksheet.Columns[2].ColumnWidth = 15;
                worksheet.Range["A2"].Text = "ĐƠN VỊ: " + expHeader.Branch;
                worksheet.Range["A3"].Text = "Bộ phận: ";
                worksheet.Range["B7"].Text = "Họ tên, người nhận hàng: " + expHeader.Reason + " Địa chỉ(Bộ phận):";
                worksheet.Range["B8"].Text = "Lý do xuất kho: " + expHeader.UserReceipt;
                worksheet.Range["B9"].Text = "Xuất tại kho: " + expHeader.StoreName + " Địa điểm: " + expHeader.StoreAddress;
                worksheet.Range["B" + totalRow + ":D" + totalRow].Merge(true);
                worksheet.Range["B" + totalRow].CellStyle.Font.Bold = true;
                worksheet.Range["B" + totalRow].Text = "Cộng: ";
                worksheet.Range["E" + totalRow].Text = ((int)listExport.Sum(x => x.QuantityPO)).ToString();
                worksheet.Range["F" + totalRow].Text = ((int)listExport.Sum(x => x.Quantity)).ToString();
                worksheet.Range["G" + totalRow].Text = ((int)listExport.Sum(x => x.SalePrice)).ToString();
                worksheet.Range["H" + totalRow].Text = ((int)listExport.Sum(x => x.TotalAmount)).ToString();

                worksheet.Range["A" + (totalRow + 1)].Text = "Tổng số tiền(viết bằng chữ): " + ConvertWholeNumber(((int)listExport.Sum(x => x.TotalAmount)).ToString());
                worksheet.Range["A" + (totalRow + 2)].Text = "Số chứng từ gốc kèm theo: " + expHeader.LotProductCode;
                //Saving the workbook as stream
                workbook.Version = ExcelVersion.Excel2010;

                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var fileName = "ExportFile_Phieu_Xuat_Kho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
        }


        #region Phần chi tiết sản phẩm theo cuộn/thùng
        [HttpPost]
        public JsonResult InsertDetailProductCoid([FromBody]MaterialStoreExpModelDetailInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                if (chk)
                {
                    var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(obj.ProductCoil));
                    if (prodPackageInfo != null)
                    {
                        prodPackageInfo.Remain = prodPackageInfo.Remain - obj.Quantity;
                        _context.ProdPackageReceiveds.Update(prodPackageInfo);

                        var prodPackageInfoHistory = new ProdPackageDelivery
                        {
                            CoilCode = prodPackageInfo.CoilCode,
                            CoilRelative = prodPackageInfo.CoilRelative,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            //DeletedBy = prodPackageInfo.DeletedBy,
                            //DeletedTime = prodPackageInfo.DeletedTime,
                            //IsDeleted = prodPackageInfo.IsDeleted,
                            LineCode = prodPackageInfo.LineCode,
                            PackType = prodPackageInfo.PackType,
                            PositionInStore = prodPackageInfo.PositionInStore,
                            ProductCoil = prodPackageInfo.ProductCoil,
                            ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
                            ProductQrCode = prodPackageInfo.ProductQrCode,
                            ProductCode = prodPackageInfo.ProductCode,
                            ProductType = prodPackageInfo.ProductType,
                            ProductLot = prodPackageInfo.ProductLot,
                            RackCode = prodPackageInfo.RackCode,
                            RackPosition = prodPackageInfo.RackPosition,
                            Remain = obj.Quantity,
                            Size = obj.Quantity,
                            TicketCode = prodPackageInfo.TicketCode,
                            TicketExpCode = obj.TicketCode,
                            //UpdatedBy = prodPackageInfo.UpdatedBy,
                            //UpdatedTime = prodPackageInfo.UpdatedTime,
                        };
                       _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);

                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                        var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                        if (mapping != null)
                        {
                            mapping.Quantity = mapping.Quantity - obj.Quantity;
                            mapping.UpdatedBy = User.Identity.Name;
                            mapping.UpdatedTime = DateTime.Now;
                            _context.ProductEntityMappings.Update(mapping);

                            //Sửa số lượng sản phẩm ra khỏi bảng Kho
                            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                            if (storeInventory != null)
                            {
                                storeInventory.Quantity = storeInventory.Quantity - obj.Quantity;
                                _context.ProductInStocks.Update(storeInventory);
                            }
                        }

                        //Trả lại dữ liệu cho bảng MaterialStoreExpGoodsDetails
                        //Chú ý: Bản ghi detail luôn tồn tại khi tạo mới phiếu xuất kho theo PO_CUS (Khi lưu Header)
                        var expGoodsDetail = _context.ProdDeliveryDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                        if (expGoodsDetail != null)
                        {
                            expGoodsDetail.Quantity = expGoodsDetail.Quantity + obj.Quantity;
                            _context.ProdDeliveryDetails.Update(expGoodsDetail);
                        }

                        var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);
                        if (header != null)
                        {
                            //Trả lại lượng sản phẩm còn phải xuất trong bảng ContractProductDetails
                            //Chú ý: Bản ghi detail luôn tồn tại khi tạo hợp đồng
                            var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == header.LotProductCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport - obj.Quantity;
                                _context.PoSaleProductDetails.Update(poProductDetail);
                            }
                        }

                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                        if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null ? obj.Quantity : subProduct.InStock - obj.Quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null ? obj.Quantity : product.InStock - obj.Quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }

                        _context.SaveChanges();

                        //Thêm log dữ liệu
                        var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                        //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                        var detailQrcode =_context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(obj.TicketCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail,
                                DetailQrcode = detailQrcode
                            };
                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdDeliveryHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdDeliveryHeaders.Update(header);
                                _context.SaveChanges();
                            }
                        }

                        msg.Title = "Thêm chi tiết sản phẩm thành công";

                        //Thay đổi dữ liệu bảng dự báo
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { prodPackageInfo.ProductCode, 0, obj.Quantity, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm chi tiết sản phẩm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteDetailProductCoid([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var prodPackageInfoHistoryUpdate =_context.ProdPackageDeliverys.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                var quantity = prodPackageInfoHistoryUpdate.Size == null ? 0 : (decimal)prodPackageInfoHistoryUpdate.Size;

                var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode));
                if (chk)
                {
                    var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(prodPackageInfoHistoryUpdate.CoilCode));
                    if (prodPackageInfo != null)
                    {
                        prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                        _context.ProdPackageReceiveds.Update(prodPackageInfo);

                        prodPackageInfoHistoryUpdate.IsDeleted = true;
                        prodPackageInfoHistoryUpdate.DeletedBy = User.Identity.Name;
                        prodPackageInfoHistoryUpdate.DeletedTime = DateTime.Now;

                       _context.ProdPackageDeliverys.Update(prodPackageInfoHistoryUpdate);

                        //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                        var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                        if (mapping != null)
                        {
                            mapping.Quantity = mapping.Quantity + quantity;
                            mapping.UpdatedBy = User.Identity.Name;
                            mapping.UpdatedTime = DateTime.Now;
                            _context.ProductEntityMappings.Update(mapping);

                            //Sửa số lượng sản phẩm ra khỏi bảng Kho
                            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                            if (storeInventory != null)
                            {
                                storeInventory.Quantity = storeInventory.Quantity + quantity;
                                _context.ProductInStocks.Update(storeInventory);
                            }
                        }

                        //Trả lại dữ liệu cho bảng MaterialStoreExpGoodsDetails
                        //Chú ý: Bản ghi detail luôn tồn tại khi tạo mới phiếu xuất kho theo PO_CUS (Khi lưu Header)
                        var expGoodsDetail = _context.ProdDeliveryDetails.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                        if (expGoodsDetail != null)
                        {
                            expGoodsDetail.Quantity = expGoodsDetail.Quantity - quantity;
                            _context.ProdDeliveryDetails.Update(expGoodsDetail);
                        }

                        var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode);
                        if (header != null)
                        {
                            //Trả lại lượng sản phẩm còn phải xuất trong bảng ContractProductDetails
                            //Chú ý: Bản ghi detail luôn tồn tại khi tạo hợp đồng
                            var poProductDetail = _context.PoSaleProductDetails.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == header.LotProductCode && x.ProductCode == prodPackageInfo.ProductCode && x.ProductType == prodPackageInfo.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedExport = poProductDetail.QuantityNeedExport + quantity;
                                _context.PoSaleProductDetails.Update(poProductDetail);
                            }
                        }

                        //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                        if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null ? quantity : subProduct.InStock + quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null ? quantity : product.InStock + quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }

                        _context.SaveChanges();

                        //Thêm log dữ liệu
                        var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                        //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                        var detailQrcode =_context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail,
                                DetailQrcode = detailQrcode
                            };
                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdDeliveryHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdDeliveryHeaders.Update(header);
                                _context.SaveChanges();
                            }
                        }

                        msg.Title = "Xóa chi tiết sản phẩm thành công";

                        //Thay đổi dữ liệu bảng dự báo
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { prodPackageInfo.ProductCode, quantity, 0, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa chi tiết sản phẩm";
            }
            return Json(msg);
        }
        #endregion


        #region Phần chi tiết sản phẩm theo xuất lẻ
        [HttpPost]
        public JsonResult InsertDetailProductOdd([FromBody]MaterialStoreExpModelDetailInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //Check xem bảng giá có không
                var headerCode = string.Empty;
                var dateNow = DateTime.Now;
                var listSalePrice = _context.ProductCostHeaders.Where(x => !x.IsDeleted).OrderByDescending(x => x.EffectiveDate).ToList();
                var salePriceApply = listSalePrice.FirstOrDefault(x => !x.IsDeleted && x.EffectiveDate <= dateNow && x.ExpiryDate >= dateNow);
                if (salePriceApply != null)
                {
                    headerCode = salePriceApply.HeaderCode;
                }
                else
                {
                    headerCode = listSalePrice.Where(x => dateNow >= x.ExpiryDate).FirstOrDefault().HeaderCode;
                }
                if (!string.IsNullOrEmpty(headerCode))
                {
                    var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    if (chk)
                    {
                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(obj.ProductCoil));
                        if (prodPackageInfo != null)
                        {
                            prodPackageInfo.Remain = prodPackageInfo.Remain - obj.Quantity;
                            _context.ProdPackageReceiveds.Update(prodPackageInfo);

                            var prodPackageInfoHistory = new ProdPackageDelivery
                            {
                                CoilCode = prodPackageInfo.CoilCode,
                                CoilRelative = prodPackageInfo.CoilRelative,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                //DeletedBy = prodPackageInfo.DeletedBy,
                                //DeletedTime = prodPackageInfo.DeletedTime,
                                //IsDeleted = prodPackageInfo.IsDeleted,
                                LineCode = prodPackageInfo.LineCode,
                                PackType = prodPackageInfo.PackType,
                                PositionInStore = prodPackageInfo.PositionInStore,
                                ProductCoil = prodPackageInfo.ProductCoil,
                                ProductCoilRelative = prodPackageInfo.ProductCoilRelative,
                                ProductQrCode = prodPackageInfo.ProductQrCode,
                                ProductCode = prodPackageInfo.ProductCode,
                                ProductType = prodPackageInfo.ProductType,
                                ProductLot = prodPackageInfo.ProductLot,
                                RackCode = prodPackageInfo.RackCode,
                                RackPosition = prodPackageInfo.RackPosition,
                                Remain = (int)obj.Quantity,
                                Size = (int)obj.Quantity,
                                TicketCode = prodPackageInfo.TicketCode,
                                TicketExpCode = obj.TicketCode,
                                //UpdatedBy = prodPackageInfo.UpdatedBy,
                                //UpdatedTime = prodPackageInfo.UpdatedTime,
                            };
                           _context.ProdPackageDeliverys.Add(prodPackageInfoHistory);

                            //Get giá
                            decimal salePrice = 0;
                            var productCostDetail = _context.ProductCostDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductCode.Equals(obj.ProductCode) && x.HeaderCode.Equals(headerCode));
                            if (productCostDetail != null)
                            {
                                if (productCostDetail.PriceCostDefault != null)
                                    salePrice = (decimal)productCostDetail.PriceCostDefault;
                            }


                            //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                            var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                            if (mapping != null)
                            {
                                mapping.Quantity = mapping.Quantity - obj.Quantity;
                                mapping.UpdatedBy = User.Identity.Name;
                                mapping.UpdatedTime = DateTime.Now;
                                _context.ProductEntityMappings.Update(mapping);

                                //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                if (storeInventory != null)
                                {
                                    storeInventory.Quantity = storeInventory.Quantity - obj.Quantity;
                                    _context.ProductInStocks.Update(storeInventory);
                                }
                            }

                            //Insert bảng detail
                            var objNewDetail = new ProdDeliveryDetail
                            {
                                //LotProductCode = .LotProductCode,
                                TicketCode = obj.TicketCode,
                                //Currency = obj.Currency,

                                ProductCode = obj.ProductCode,
                                ProductType = obj.ProductType,
                                ProductQrCode = obj.ProductQrCode,
                                Quantity = obj.Quantity,
                                Unit = obj.Unit,
                                SalePrice = salePrice,
                                TaxRate = obj.TaxRate,
                                Discount = obj.Discount,
                                Commission = obj.Commission,
                                RackCode = obj.RackCode,

                                ProductCoil = obj.ProductCoil,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                            };
                            _context.ProdDeliveryDetails.Add(objNewDetail);


                            var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == obj.TicketCode);

                            //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                            if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                            {
                                var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                                if (subProduct != null)
                                {
                                    subProduct.InStock = subProduct.InStock == null ? obj.Quantity : subProduct.InStock - obj.Quantity;
                                    _context.SubProducts.Update(subProduct);
                                }
                            }
                            else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                            {
                                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                                if (product != null)
                                {
                                    product.InStock = product.InStock == null ? obj.Quantity : product.InStock - obj.Quantity;
                                    _context.MaterialProducts.Update(product);
                                }
                            }

                            _context.SaveChanges();

                            //Thêm log dữ liệu
                            var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                            var detailQrcode =_context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(obj.TicketCode)).ToList();
                            if (header != null)
                            {
                                var logData = new
                                {
                                    Header = header,
                                    Detail = detail,
                                    DetailQrcode = detailQrcode
                                };
                                var listLogData = new List<object>();

                                if (!string.IsNullOrEmpty(header.LogData))
                                {
                                    listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                    logData.Header.LogData = null;
                                    listLogData.Add(logData);
                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProdDeliveryHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                                else
                                {
                                    listLogData.Add(logData);

                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProdDeliveryHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                            }

                            msg.Title = "Thêm chi tiết sản phẩm thành công";

                            //Thay đổi dữ liệu bảng dự báo
                            string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { prodPackageInfo.ProductCode, obj.Quantity, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                            _repositoryService.CallProc("PR_INSERT_STORE_EXP_DETAIL", param, val);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không có bảng giá. Vui lòng tạo bảng giá";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm chi tiết sản phẩm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteDetailProductOdd([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var expGoodsDetail = _context.ProdDeliveryDetails.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                if (expGoodsDetail != null)
                {
                    var prodPackageInfoHistoryUpdate =_context.ProdPackageDeliverys.FirstOrDefault(x => !x.IsDeleted && x.CoilCode == expGoodsDetail.ProductCoil && (decimal)x.Size == expGoodsDetail.Quantity);
                    var quantity = expGoodsDetail.Quantity;

                    var chk = _context.ProdDeliveryHeaders.Any(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode));
                    if (chk)
                    {
                        var prodPackageInfo = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(prodPackageInfoHistoryUpdate.CoilCode));
                        if (prodPackageInfo != null)
                        {
                            prodPackageInfo.Remain = prodPackageInfo.Remain + quantity;
                            _context.ProdPackageReceiveds.Update(prodPackageInfo);

                            prodPackageInfoHistoryUpdate.IsDeleted = true;
                            prodPackageInfoHistoryUpdate.DeletedBy = User.Identity.Name;
                            prodPackageInfoHistoryUpdate.DeletedTime = DateTime.Now;

                           _context.ProdPackageDeliverys.Update(prodPackageInfoHistoryUpdate);

                            //Bỏ sản phẩm ra khỏi vị trí trong bảng Mapping
                            var mapping = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.RackCode.Equals(prodPackageInfo.RackCode));
                            if (mapping != null)
                            {
                                mapping.Quantity = mapping.Quantity + quantity;
                                mapping.UpdatedBy = User.Identity.Name;
                                mapping.UpdatedTime = DateTime.Now;
                                _context.ProductEntityMappings.Update(mapping);

                                //Sửa số lượng sản phẩm ra khỏi bảng Kho
                                var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(prodPackageInfo.ProductQrCode) && x.StoreCode == mapping.WHS_Code);
                                if (storeInventory != null)
                                {
                                    storeInventory.Quantity = storeInventory.Quantity + quantity;
                                    _context.ProductInStocks.Update(storeInventory);
                                }
                            }

                            //Xóa bản ghi bảng MaterialStoreExpGoodsDetails
                            expGoodsDetail.IsDeleted = true;
                            expGoodsDetail.DeletedBy = User.Identity.Name;
                            expGoodsDetail.DeletedTime = DateTime.Now;
                            _context.ProdDeliveryDetails.Update(expGoodsDetail);

                            //Trừ lượng tồn của sản phẩm từ bảng Product - Sub Product
                            if (prodPackageInfo.ProductType == "SUB_PRODUCT")
                            {
                                var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodPackageInfo.ProductCode);
                                if (subProduct != null)
                                {
                                    subProduct.InStock = subProduct.InStock == null ? quantity : subProduct.InStock + quantity;
                                    _context.SubProducts.Update(subProduct);
                                }
                            }
                            else if (prodPackageInfo.ProductType == "FINISHED_PRODUCT")
                            {
                                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == prodPackageInfo.ProductCode);
                                if (product != null)
                                {
                                    product.InStock = product.InStock == null ? quantity : product.InStock + quantity;
                                    _context.MaterialProducts.Update(product);
                                }
                            }

                            _context.SaveChanges();

                            //Thêm log dữ liệu
                            var header = _context.ProdDeliveryHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode == prodPackageInfoHistoryUpdate.TicketExpCode);
                            var detail = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                            //Trường hợp xuất PO thì có thêm thông tin lưu các QRCode & Rack
                            var detailQrcode =_context.ProdPackageDeliverys.Where(x => x.TicketExpCode.Equals(prodPackageInfoHistoryUpdate.TicketExpCode)).ToList();
                            if (header != null)
                            {
                                var logData = new
                                {
                                    Header = header,
                                    Detail = detail,
                                    DetailQrcode = detailQrcode
                                };
                                var listLogData = new List<object>();

                                if (!string.IsNullOrEmpty(header.LogData))
                                {
                                    listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                    logData.Header.LogData = null;
                                    listLogData.Add(logData);
                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProdDeliveryHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                                else
                                {
                                    listLogData.Add(logData);

                                    header.LogData = JsonConvert.SerializeObject(listLogData);

                                    _context.ProdDeliveryHeaders.Update(header);
                                    _context.SaveChanges();
                                }
                            }

                            msg.Title = "Xóa chi tiết sản phẩm thành công";

                            //Thay đổi dữ liệu bảng dự báo
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { prodPackageInfo.ProductCode, quantity, 0, prodPackageInfo.ProductType, header.LotProductCode, header.TimeTicketCreate };
                            _repositoryService.CallProc("PR_UPDATE_STORE_EXP_DETAIL", param, val);
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Dữ liệu không tồn tại. Vui lòng tải lại trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi xóa chi tiết sản phẩm";
            }
            return Json(msg);
        }
        #endregion


        #region Get thông tin chung
        [HttpPost]
        public object GetListLotProduct()
        {
            //Giờ lấy theo lô hàng bán ra để xuất kho (phiếu đặt hàng Customer)
            var rs = (from a in _context.PoSaleHeaderNotDones
                      orderby a.ContractHeaderID descending
                      select new
                      {
                          Code = a.ContractCode,
                          Name = a.Title,

                      });
            return rs;
        }
        [HttpPost]
        public object GetListLotProduct4Update(string lotProductCode)
        {
            //Giờ lấy theo lô hàng bán ra để xuất kho (phiếu đặt hàng Customer)
            var rs1 = (from a in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                       orderby a.ContractHeaderID descending
                       select new
                       {
                           Code = a.ContractCode,
                           Name = a.Title,
                       });
            var rs2 = (from a in _context.PoSaleHeaderNotDones.Where(x => x.ContractCode != lotProductCode)
                       orderby a.ContractHeaderID descending
                       select new
                       {
                           Code = a.ContractCode,
                           Name = a.Title,
                       });
            return rs1.Concat(rs2);
        }
        [HttpPost]
        public object GetListStore()
        {
            var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
            return rs;
        }
        [HttpPost]
        public object GetListContract()
        {
            var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted).OrderBy(x => x.Title).Select(x => new { Code = x.ContractCode, Name = x.Title, Version = x.Version });
            return rs;
        }
        [HttpPost]
        public object GetListCustomer()
        {
            var rs = _context.Customerss.Where(x => !x.IsDeleted && x.ActivityStatus == "CUSTOMER_ACTIVE").OrderBy(x => x.CusName).Select(x => new { Code = x.CusCode, Name = x.CusName });
            return rs;
        }
        [HttpPost]
        public string GetCustomer(string contractCode)
        {
            var rs = _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == contractCode).Select(x => new { x.CusCode }).FirstOrDefault();
            if (rs != null)
            {
                return rs.CusCode;
            }
            else
            {
                return null;
            }
        }
        [HttpPost]
        public object GetListUserExport()
        {
            //var rs = _context.Users.Where(x => x.Active && x.UserName != "admin").OrderBy(x => x.GivenName).Select(x => new { Code = x.UserName, Name = x.GivenName });
            var data = from a in _context.Users.Where(x => x.Active && x.UserName != "admin").Select(x => new { Code = x.UserName, Name = x.GivenName, Id = x.Id })
                       join b in _context.AdUserInGroups.Where(x => x.IsMain) on a.Id equals b.UserId
                       orderby a.Name
                       select a;
            return data;
        }
        [HttpPost]
        public object GetListReason()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_REASON").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListProduct(string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var rs = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                      join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                      join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                      from e2 in e1.DefaultIfEmpty()
                      select new
                      {
                          Code = a.ProductQrCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = a.Unit,
                          ProductCode = a.ProductCode,
                          UnitName = c2.ValueSet,
                          Quantity = a.Quantity,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          e2.SupCode,
                          e2.SupName
                      })
                        .Concat(from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                                join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                                join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                from e2 in e1.DefaultIfEmpty()
                                select new
                                {
                                    Code = a.ProductQrCode,
                                    Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                                    Unit = b.Unit,
                                    ProductCode = b.ProductQrCode,
                                    UnitName = c2.ValueSet,
                                    Quantity = a.Quantity,
                                    b.AttributeCode,
                                    b.AttributeName,
                                    ProductType = "SUB_PRODUCT",
                                    e2.SupCode,
                                    e2.SupName
                                });
            //return Json(query.ToList());

            return rs;
        }

        [HttpPost]
        public object GetListProductCode(string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            var rs = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                      join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                      join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                      from e2 in e1.DefaultIfEmpty()
                      select new
                      {
                          Code = a.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = a.Unit,
                          ProductCode = a.ProductCode,
                          UnitName = c2.ValueSet,
                          Quantity = a.Quantity,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          e2.SupCode,
                          e2.SupName
                      }).ToList()
                        .Concat(from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                                join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                                join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
                                join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                                from c2 in c1.DefaultIfEmpty()
                                join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                from e2 in e1.DefaultIfEmpty()
                                select new
                                {
                                    Code = a.ProductQrCode,
                                    Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                                    Unit = b.Unit,
                                    ProductCode = b.ProductQrCode,
                                    UnitName = c2.ValueSet,
                                    Quantity = a.Quantity,
                                    b.AttributeCode,
                                    b.AttributeName,
                                    ProductType = "SUB_PRODUCT",
                                    e2.SupCode,
                                    e2.SupName
                                }).ToList();

            var dataRs = rs.GroupBy(x => x.ProductCode).Select(x => new
            {
                x.First().Code,
                x.First().Name,
                x.First().ProductCode,
                x.First().Unit,
                x.First().UnitName,
                x.First().Quantity,
                x.First().AttributeCode,
                x.First().AttributeName,
                x.First().ProductType,
                x.First().SupCode,
                x.First().SupName,
            });

            var listProductCode = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode))
                                  join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                                  join c in _context.ProductInStocks.Where(x => !x.IsDeleted) on a.ProductQrCode equals c.ProductQrCode
                                  join d in dataRs on new { c.ProductCode, c.ProductType } equals new { d.ProductCode, d.ProductType }
                                  select new
                                  {
                                      d.Code,
                                      d.Name,
                                      d.ProductCode,
                                      d.Unit,
                                      d.UnitName,
                                      d.Quantity,
                                      d.AttributeCode,
                                      d.AttributeName,
                                      d.ProductType,
                                      d.SupCode,
                                      d.SupName,
                                  };

            var listResult = listProductCode.GroupBy(x => x.ProductCode).Select(x => new
            {
                x.First().Code,
                x.First().Name,
                x.First().ProductCode,
                x.First().Unit,
                x.First().UnitName,
                x.First().Quantity,
                x.First().AttributeCode,
                x.First().AttributeName,
                x.First().ProductType,
                x.First().SupCode,
                x.First().SupName,
            });

            return listResult;
        }

        [HttpGet]
        public object GetPositionProduct(string productCode, string productLot, string storeCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductCode.Equals(productCode) && x.ProductLot.Equals(productLot) && (x.Remain != null && x.Remain > 0))
                               join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                               join c in _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode.Equals(storeCode)) on a.ProductQrCode equals c.ProductQrCode
                               let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                               select new
                               {
                                   a.Id,
                                   a.ProductQrCode,
                                   ProductCoil = a.CoilCode,
                                   ProductCoilRelative = a.CoilRelative,
                                   a.Remain,
                                   a.Size,
                                   a.TicketCode,
                                   a.PackType,
                                   a.PositionInStore,
                                   a.RackCode,
                                   a.RackPosition,
                                   a.CreatedBy,
                                   a.CreatedTime,
                                   a.UpdatedBy,
                                   a.UpdatedTime,
                                   sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                               };

                msg.Error = false;
                msg.Object = listCoil;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetListProduct4QrCode(string storeCode, string productCode, string productType)
        {
            if (productType == "FINISHED_PRODUCT")
            {
                var rs = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT" && x.ProductCode == productCode)
                          join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                          join b in _context.MaterialProducts on a.ProductCode equals b.ProductCode
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join e in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals e.ProductQrCode
                          select new
                          {
                              Code = a.ProductCode,
                              Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                              Unit = a.Unit,
                              ProductCode = a.ProductCode,
                              UnitName = c2.ValueSet,
                              Quantity = a.Quantity,
                              AttributeCode = "",
                              AttributeName = "",
                              ProductType = "FINISHED_PRODUCT",
                          }).ToList();

                var rsData = rs.GroupBy(x => x.ProductCode).Select(x => new
                {
                    x.First().Code,
                    x.First().Name,
                    x.First().Unit,
                    x.First().ProductCode,
                    x.First().UnitName,
                    x.First().Quantity,
                    x.First().AttributeCode,
                    x.First().AttributeName,
                    x.First().ProductType,
                });

                return rsData;
            }
            else
            {
                var rs = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT" && x.ProductCode == productCode)
                          join d in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted && x.StoreCode == storeCode) on a.TicketCode equals d.TicketCode
                          join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode
                          join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                          from c2 in c1.DefaultIfEmpty()
                          join e in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals e.ProductQrCode
                          select new
                          {
                              Code = a.ProductQrCode,
                              Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                              Unit = b.Unit,
                              ProductCode = b.ProductQrCode,
                              UnitName = c2.ValueSet,
                              Quantity = a.Quantity,
                              b.AttributeCode,
                              b.AttributeName,
                              ProductType = "SUB_PRODUCT",
                          }).ToList();

                var rsData = rs.GroupBy(x => x.ProductCode).Select(x => new
                {
                    x.First().Code,
                    x.First().Name,
                    x.First().Unit,
                    x.First().ProductCode,
                    x.First().UnitName,
                    x.First().Quantity,
                    x.First().AttributeCode,
                    x.First().AttributeName,
                    x.First().ProductType,
                });

                return rsData;
            }
        }

        [HttpPost]
        public object GetListGridProduct(string ticketExpCode, string productCode, string productType)
        {
            if (productType == "FINISHED_PRODUCT")
            {
                var rs = (from a in _context.ProdPackageDeliverys.Where(y => !y.IsDeleted && y.TicketExpCode == ticketExpCode && y.ProductCode == productCode)
                          join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                          join d in _context.EDMSLines on c.LineCode equals d.LineCode
                          join e in _context.EDMSFloors on d.FloorCode equals e.FloorCode
                          join f in _context.MaterialProducts.Where(y => !y.IsDeleted) on a.ProductCode equals f.ProductCode
                          join g in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f.Unit equals g.CodeSet
                          let name = e.FloorName + " - " + d.L_Text + " - " + c.RackName
                          let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                          orderby f.ProductName
                          select new
                          {
                              a.Id,
                              ProductCode = productCode,
                              ProductType = "FINISHED_PRODUCT",
                              ProductName = "Thành phẩm _ " + f.ProductName,
                              ProductQrCode = a.ProductQrCode,
                              sProductQrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                              Unit = f.Unit,
                              UnitName = g.ValueSet,

                              Quantity = a.Size,
                              RackCode = a.RackCode,
                              RackName = name,
                              ProductCoil = a.CoilCode,
                              a.ProductLot,
                              sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                          });
                return rs;
            }
            else
            {
                var rs = (from a in _context.ProdPackageDeliverys.Where(y => !y.IsDeleted && y.TicketExpCode == ticketExpCode && y.ProductCode == productCode)
                          join c in _context.EDMSRacks on a.RackCode equals c.RackCode
                          join d in _context.EDMSLines on c.LineCode equals d.LineCode
                          join e in _context.EDMSFloors on d.FloorCode equals e.FloorCode
                          join f in _context.SubProducts.Where(y => !y.IsDeleted) on a.ProductCode equals f.ProductQrCode
                          join i in _context.MaterialProducts.Where(y => !y.IsDeleted) on f.ProductCode equals i.ProductCode
                          join g in _context.CommonSettings.Where(y => !y.IsDeleted && y.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on f.Unit equals g.CodeSet
                          let name = e.FloorName + " - " + d.L_Text + " - " + c.RackName
                          let listProd = a.CoilCode.Split("_", StringSplitOptions.None)
                          orderby f.AttributeName
                          select new
                          {
                              a.Id,
                              ProductCode = productCode,
                              ProductType = "SUB_PRODUCT",
                              ProductName = i.ProductCode + " _ " + f.AttributeName,
                              ProductQrCode = a.ProductQrCode,
                              sProductQrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                              Unit = f.Unit,
                              UnitName = g.ValueSet,

                              Quantity = a.Size,
                              RackCode = a.RackCode,
                              RackName = name,
                              ProductCoil = a.CoilCode,
                              a.ProductLot,
                              sProductCoil = !string.IsNullOrEmpty(a.CoilCode) ? listProd[listProd.Length - 2] : "",
                          });
                return rs;
            }
        }

        [HttpPost]
        public object GetListCoilByProdQrCode(string storeCode, string productCode, string productType, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var ProdPackageInfos = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductQrCode.Equals(productQrCode) && x.Remain > 0).Select(x => new
                {
                    x.Id,
                    x.ProductQrCode,
                    ProductCoil = x.CoilCode,
                    ProductCoilRelative = x.CoilRelative,
                    x.Remain,
                    x.Size,
                    x.TicketCode,
                    x.PackType,
                    x.PositionInStore,
                    x.RackCode,
                    x.RackPosition,
                    x.CreatedBy,
                    x.CreatedTime,
                    x.UpdatedBy,
                    x.UpdatedTime,
                    x.UnitCoil,
                    x.ProductImpType,
                    x.ProductLot,
                    IsOrder = !string.IsNullOrEmpty(x.RackCode) ? "Đã xếp kho" : "Chưa xếp kho",
                }).ToList();

                var ListCoil = from a in ProdPackageInfos
                               select new
                               {
                                   a.Id,
                                   a.ProductQrCode,
                                   a.ProductCoil,
                                   a.ProductCoilRelative,
                                   a.Remain,
                                   a.Size,
                                   a.TicketCode,
                                   a.PackType,
                                   a.PositionInStore,
                                   a.RackCode,
                                   a.RackPosition,
                                   a.CreatedBy,
                                   a.CreatedTime,
                                   a.UpdatedBy,
                                   a.UpdatedTime,
                                   a.UnitCoil,
                                   a.ProductImpType,
                                   a.ProductLot,
                                   a.IsOrder,
                               };

                mess.Object = ListCoil;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [HttpPost]
        public object GetListLotByProdQrCode(string storeCode, string productCode, string productType, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {

                var listLot = new List<ProdPackageReceived>();
                var prodPackageInfos = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && x.ProductQrCode.Equals(productQrCode) && x.Remain > 0).Select(x => new
                {
                    x.Id,
                    x.ProductQrCode,
                    ProductCoil = x.CoilCode,
                    ProductCoilRelative = x.CoilRelative,
                    x.Remain,
                    x.Size,
                    x.TicketCode,
                    x.PackType,
                    x.PositionInStore,
                    x.RackCode,
                    x.RackPosition,
                    x.CreatedBy,
                    x.CreatedTime,
                    x.UpdatedBy,
                    x.UpdatedTime,
                    x.UnitCoil,
                    x.ProductImpType,
                    x.ProductLot,
                    StoreCode = "",
                    IsOrder = !string.IsNullOrEmpty(x.RackCode) ? "Đã xếp kho" : "Chưa xếp kho",
                }).ToList();

                foreach (var item in prodPackageInfos)
                {
                    var _storeCode = item.RackCode.Split("_")[item.RackCode.Split("_").Length - 1];
                    if (string.IsNullOrEmpty(storeCode) || _storeCode.Equals(storeCode))
                    {
                        var obj = new ProdPackageReceived
                        {
                            Id = item.Id,
                            ProductQrCode = item.ProductQrCode,
                            ProductCoil = item.ProductCoil,
                            ProductCoilRelative = item.ProductCoilRelative,
                            Remain = item.Remain,
                            Size = item.Size,
                            TicketCode = item.TicketCode,
                            PackType = item.PackType,
                            PositionInStore = item.PositionInStore,
                            RackCode = item.RackCode,
                            RackPosition = item.RackPosition,
                            CreatedBy = item.CreatedBy,
                            CreatedTime = item.CreatedTime,
                            UpdatedBy = item.UpdatedBy,
                            UpdatedTime = item.UpdatedTime,
                            UnitCoil = item.UnitCoil,
                            ProductImpType = item.ProductImpType,
                            ProductLot = item.ProductLot,
                            StoreCode = _storeCode,
                        };

                        listLot.Add(obj);
                    }
                }

                var listRs = listLot.GroupBy(x => new { x.ProductLot, x.UnitCoil }).Select(p => new
                {
                    p.First().ProductLot,
                    Quantity = p.Count(),
                    QuantityUnit = p.Sum(y => y.Remain),
                    p.First().UnitCoil,
                    p.First().StoreCode
                });
                mess.Object = listRs;
            }
            catch (Exception ex)
            {
                mess.Error = true;
                //mess.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_IMPORT_WARE_HOURE_EXITS"));
                mess.Title = _stringLocalizer["MIS_MSG_IMPORT_WARE_HOURE_EXITS"];
            }
            return Json(mess);
        }

        [HttpPost]
        public object GetListProductLot(string productCode, string storeCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var rs = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode) && (x.Remain != null && x.Remain > 0))
                         join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                         join c in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode.Equals(productCode) && x.StoreCode.Equals(storeCode)) on a.ProductQrCode equals c.ProductQrCode
                         group a.ProductLot by a.ProductLot into g
                         select new
                         {
                             Code = g.Key,
                             Name = g.Key
                         };

                msg.Error = false;
                msg.Object = rs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetListRackCode(string productQrCode)
        {
            var rs = from a in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
                     join b in _context.EDMSRacks on a.RackCode equals b.RackCode
                     join c in _context.EDMSLines on b.LineCode equals c.LineCode
                     join d in _context.EDMSFloors on c.FloorCode equals d.FloorCode
                     let name = d.FloorName + " - " + c.L_Text + " - " + b.RackName
                     orderby name
                     select new
                     {
                         Code = a.RackCode,
                         Name = name,
                         Quantity = a.Quantity,
                     };
            return rs;
        }
        ////Hướng cũ - mỗi sản phẩm khi import là 1 giá khác nhau
        //[HttpPost]
        //public object GetSalePrice(string qrCode)
        //{
        //    var rs = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted && x.ProductCode == qrCode)
        //              join b in _context.ProductCostHeaders.Where(x => !x.IsDeleted && x.EffectiveDate <= DateTime.Now && x.ExpiryDate >= DateTime.Now) on a.HeaderCode equals b.HeaderCode
        //              select new
        //              {
        //                  SalePrice = a.PriceCost,
        //                  TaxRate = a.Tax,
        //                  //Discount = a.Discount,
        //                  //Commission = a.Commission,
        //                  Discount = 0,
        //                  Commission = 0,
        //              }).FirstOrDefault();
        //    return rs;
        //}
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListPaymentStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "EXP_PAYMENT_STATUS").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        //Hướng mới - xuất kho theo lô sản phẩm bán (PO_Customer)
        [HttpPost]
        public object GetLotProduct(string lotProductCode, string storeCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            //var today = DateTime.Now.ToString("ddMMyyyy-HHmm");
            if (!string.IsNullOrEmpty(storeCode))
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport,
                                       //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                       Quantity = 0,
                                       QuantityNeedExport = a.QuantityNeedExport,
                                       //QuantityInStockTotal = (decimal)b1.InStock,
                                       QuantityInStockTotal = productInStockTotal,
                                       QuantityInStock = productInStock,
                                       QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport,
                                               //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                               Quantity = 0,
                                               QuantityNeedExport = a.QuantityNeedExport,
                                               //QuantityInStockTotal = (decimal)b1.InStock,
                                               QuantityInStockTotal = productInStockTotal,
                                               QuantityInStock = productInStock,
                                               QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
            else
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport,
                                       QuantityNeedExport = a.QuantityNeedExport,
                                       //Quantity = a.QuantityNeedExport,
                                       Quantity = 0,
                                       QuantityInStockTotal = productInStockTotal,
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport,
                                               QuantityNeedExport = a.QuantityNeedExport,
                                               //Quantity = a.QuantityNeedExport,
                                               Quantity = 0,
                                               QuantityInStockTotal = productInStockTotal,
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
        }

        //Hướng mới - xuất kho theo lô sản phẩm bán (PO_Customer)
        //cộng thêm số lượng từ phiếu xuất kho chi tiết cho số lượng order
        [HttpPost]
        public object GetLotProduct4Update(string lotProductCode, string storeCode, string ticketCode)
        {
            var listSupplier = (from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted)
                                join b in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.PoSupCode equals b.PoSupCode
                                join c in _context.Suppliers.Where(x => !x.IsDeleted) on b.SupCode equals c.SupCode into c1
                                from c2 in c1.DefaultIfEmpty()
                                select new
                                {
                                    a.ProductCode,
                                    a.ProductType,
                                    b.SupCode,
                                    c2.SupName
                                }).ToList();

            var listSupplierGroup = listSupplier.GroupBy(x => x.ProductCode).Select(p => new
            {
                p.First().ProductCode,
                p.First().ProductType,
                SupCode = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupCode)),
                SupName = string.Join(",", p.GroupBy(x => x.SupCode).Select(k => k.First().SupName)),
            }).ToList();

            //var today = DateTime.Now.ToString("ddMMyyyy-HHmm");
            if (!string.IsNullOrEmpty(storeCode))
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInDetailExp = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                       //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                       Quantity = 0,
                                       //QuantityInStockTotal = (decimal)b1.InStock,
                                       QuantityInStockTotal = productInStockTotal,
                                       QuantityInStock = productInStock,
                                       QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInStock = _context.ProductInStocks.Where(x => !x.IsDeleted && x.StoreCode == storeCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInDetailExp = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                               //Quantity = Math.Min(productInStock, a.QuantityNeedExport),
                                               Quantity = 0,
                                               //QuantityInStockTotal = (decimal)b1.InStock,
                                               QuantityInStockTotal = productInStockTotal,
                                               QuantityInStock = productInStock,
                                               QuantityMax = Math.Min(productInStock, a.QuantityNeedExport),
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
            else
            {
                var ListProduct = (from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                   join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.ContractCode equals a.ContractCode
                                   join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                                   join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                   from e2 in e1.DefaultIfEmpty()
                                       //let productQrCode = a.ProductCode + "_0_" + a.ContractCode + "_T." + today
                                   let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   let productInDetailExp = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "FINISHED_PRODUCT").Sum(x => x.Quantity)
                                   orderby b1.ProductName
                                   select new
                                   {
                                       ProductCode = a.ProductCode,
                                       ProductName = "Thành phẩm _ " + b1.ProductName,
                                       ProductType = "FINISHED_PRODUCT",
                                       //ProductQrCode = productQrCode,
                                       //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                       Unit = b1.Unit,
                                       UnitName = (c1 != null ? c1.ValueSet : ""),
                                       QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                       //Quantity = a.QuantityNeedExport,
                                       Quantity = 0,
                                       QuantityInStockTotal = productInStockTotal,
                                       e2.SupCode,
                                       e2.SupName,
                                   })
                                   .Concat(from a1 in _context.PoSaleHeaders.Where(x => !x.IsDeleted && x.ContractCode == lotProductCode)
                                           join a in _context.PoSaleProductDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.ContractCode equals a.ContractCode
                                           join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                           join d in _context.MaterialProducts.Where(x => !x.IsDeleted) on b1.ProductCode equals d.ProductCode
                                           join c1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b1.Unit equals c1.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join e in listSupplierGroup on a.ProductCode equals e.ProductCode into e1
                                           from e2 in e1.DefaultIfEmpty()
                                               //let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.ContractCode + "_T." + today
                                           let productInStockTotal = _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           let productInDetailExp = _context.ProdDeliveryDetails.Where(x => !x.IsDeleted && x.TicketCode == ticketCode && x.LotProductCode == lotProductCode && x.ProductCode == a.ProductCode && x.ProductType == "SUB_PRODUCT").Sum(x => x.Quantity)
                                           orderby b1.AttributeName
                                           select new
                                           {
                                               ProductCode = a.ProductCode,
                                               ProductName = d.ProductCode + " _ " + b1.AttributeName,
                                               ProductType = "SUB_PRODUCT",
                                               //ProductQrCode = productQrCode,
                                               //sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                               Unit = b1.Unit,
                                               UnitName = (c1 != null ? c1.ValueSet : ""),
                                               QuantityOrder = a.QuantityNeedExport + productInDetailExp,
                                               //Quantity = a.QuantityNeedExport,
                                               Quantity = 0,
                                               QuantityInStockTotal = productInStockTotal,
                                               e2.SupCode,
                                               e2.SupName,
                                           });

                var CusCode = _context.PoSaleHeaders.FirstOrDefault(x => !x.IsDeleted && x.ContractCode == lotProductCode)?.CusCode;

                return new { ListProduct, CusCode = CusCode };
            }
        }

        //[HttpPost]
        //public object Getsupplier()
        //{
        //    var supplier = _context.Suppliers.AsParallel().Where(x => !x.IsDeleted).Select(x => new { Id = x.SupID, Name = x.SupName });
        //    return supplier;
        //}
        //[HttpPost]
        //public object GetUser()
        //{
        //    var query = _context.Users.Where(x => x.Active && x.UserName != "admin").AsParallel().Select(x => new { Id = x.Id, Name = x.GivenName });
        //    return query;
        //}
        //[HttpGet]
        //public object GetUnit(string impCode)
        //{
        //    var unit = _context.ProdReceivedDetails.Where(x => x.ImpCode == impCode).Select(x => x.Unit);
        //    var list = _context.CommonSettings.Where(x => unit.Any(y => x.CodeSet == y)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
        //    return list;
        //}
        #endregion


        #region Tạo mã QR_Code
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
        #endregion


        #region Khu vực các model
        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }
        public class JTableProductRes
        {
            public int Id { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string Quantity { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public string LotProductCode { get; set; }
            public double Cost { get; set; }
            public double Tax { get; set; }
            public string Note { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
        }
        public class MaterialStoreExpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserExport { get; set; }
            public string UserExportName { get; set; }
            public string UserReceipt { get; set; }
            public decimal? CostTotal { get; set; }
            public string Currency { get; set; }
            public string CurrencyName { get; set; }
            public decimal? Discount { get; set; }
            public decimal? Commission { get; set; }
            public decimal? TaxTotal { get; set; }
            public string Note { get; set; }
            public string PositionGps { get; set; }
            public string PositionText { get; set; }
            public string FromDevice { get; set; }
            public decimal? TotalPayed { get; set; }
            public decimal? TotalMustPayment { get; set; }
            public DateTime? InsurantTime { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
            public DateTime? NextTimePayment { get; set; }
            public string Reason { get; set; }
            public string ReasonName { get; set; }
            public string StoreCodeReceipt { get; set; }
            public string PaymentStatus { get; set; }
            public string PaymentStatusName { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string DeletedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public bool IsDeleted { get; set; }
        }
        public class MaterialStoreExpModelInsert
        {
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeReceipt { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserExport { get; set; }
            public string Note { get; set; }
            public string UserReceipt { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public List<MaterialStoreExpModelDetailInsert> ListProduct { get; set; }
            public List<MaterialStoreExpModelDetailInsertPo> ListPoProduct { get; set; }
        }
        public class MaterialStoreExpModelDetailInsertPo : MaterialStoreExpModelDetailInsert
        {
            public List<MaterialStoreExpModelDetailInsert> ListProductInRack { get; set; }
        }
        public class MaterialStoreExpModelDetailInsert
        {
            public int? Id { get; set; }
            public string TicketCode { get; set; }
            public string ProductCoil { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityOrder { get; set; }
            public decimal QuantityInStockTotal { get; set; }
            public decimal QuantityInStock { get; set; }
            public decimal QuantityMax { get; set; }
            public string Unit { get; set; }
            public string UnitName { get; set; }
            public decimal SalePrice { get; set; }
            public int? TaxRate { get; set; }
            public int? Discount { get; set; }
            public int? Commission { get; set; }
            public decimal Total { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal DiscountTotal { get; set; }
            public decimal CommissionTotal { get; set; }
        }
        #endregion


        #region Số tiền thành chữ
        private static String ones(String Number)
        {
            int _Number = Convert.ToInt32(Number);
            String name = "";
            switch (_Number)
            {

                case 1:
                    name = "Một";
                    break;
                case 2:
                    name = "Hai";
                    break;
                case 3:
                    name = "Ba";
                    break;
                case 4:
                    name = "Bốn";
                    break;
                case 5:
                    name = "Năm";
                    break;
                case 6:
                    name = "Sáu";
                    break;
                case 7:
                    name = "Bảy";
                    break;
                case 8:
                    name = "Tám";
                    break;
                case 9:
                    name = "Chín";
                    break;
            }
            return name;
        }
        private static String tens(String Number)
        {
            int _Number = Convert.ToInt32(Number);
            String name = null;
            switch (_Number)
            {
                case 10:
                    name = "Mười";
                    break;
                case 11:
                    name = "Mười một";
                    break;
                case 12:
                    name = "Mười hai";
                    break;
                case 13:
                    name = "Mười ba";
                    break;
                case 14:
                    name = "Mười bốn";
                    break;
                case 15:
                    name = "Mười năm";
                    break;
                case 16:
                    name = "Mười sáu";
                    break;
                case 17:
                    name = "Mười bảy";
                    break;
                case 18:
                    name = "Mười tám";
                    break;
                case 19:
                    name = "Mười chín";
                    break;
                case 20:
                    name = "Hai mươi";
                    break;
                case 30:
                    name = "Ba mươi";
                    break;
                case 40:
                    name = "Bốn mươi";
                    break;
                case 50:
                    name = "Năm mươi";
                    break;
                case 60:
                    name = "Sáu mươi";
                    break;
                case 70:
                    name = "Bảy mươi";
                    break;
                case 80:
                    name = "Tám mươi";
                    break;
                case 90:
                    name = "Chín mươi";
                    break;
                default:
                    if (_Number > 0)
                    {
                        name = tens(Number.Substring(0, 1) + "0") + " " + ones(Number.Substring(1));
                    }
                    break;
            }
            return name;
        }

        private static String ConvertWholeNumber(String Number)
        {
            string word = "";
            try
            {
                bool beginsZero = false;//tests for 0XX   
                bool isDone = false;//test if already translated   
                double dblAmt = (Convert.ToDouble(Number));
                //if ((dblAmt > 0) && number.StartsWith("0"))   
                if (dblAmt > 0)
                {//test for zero or digit zero in a nuemric   
                    beginsZero = Number.StartsWith("0");

                    int numDigits = Number.Length;
                    int pos = 0;//store digit grouping   
                    String place = "";//digit grouping name:hundres,thousand,etc...   
                    switch (numDigits)
                    {
                        case 1://ones' range   

                            word = ones(Number);
                            isDone = true;
                            break;
                        case 2://tens' range   
                            word = tens(Number);
                            isDone = true;
                            break;
                        case 3://hundreds' range   
                            pos = (numDigits % 3) + 1;
                            place = " Trăm ";
                            break;
                        case 4://thousands' range   
                        case 5:
                        case 6:
                            pos = (numDigits % 4) + 1;
                            place = " Nghìn ";
                            break;
                        case 7://millions' range   
                        case 8:
                        case 9:
                            pos = (numDigits % 7) + 1;
                            place = " Triệu ";
                            break;
                        case 10://Billions's range   
                        case 11:
                        case 12:

                            pos = (numDigits % 10) + 1;
                            place = " Tỉ ";
                            break;
                        //add extra case options for anything above Billion...   
                        default:
                            isDone = true;
                            break;
                    }
                    if (!isDone)
                    {//if transalation is not done, continue...(Recursion comes in now!!)   
                        if (Number.Substring(0, pos) != "0" && Number.Substring(pos) != "0")
                        {
                            try
                            {
                                word = ConvertWholeNumber(Number.Substring(0, pos)) + place + ConvertWholeNumber(Number.Substring(pos));
                            }
                            catch { }
                        }
                        else
                        {
                            word = ConvertWholeNumber(Number.Substring(0, pos)) + ConvertWholeNumber(Number.Substring(pos));
                        }


                    }
                    //ignore digit grouping names   
                    if (word.Trim().Equals(place.Trim())) word = "";
                }
            }
            catch { }
            return word.Trim();
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_customerLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}