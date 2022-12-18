using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialImpStoreController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<MaterialImpStoreController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public MaterialImpStoreController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<MaterialImpStoreController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
        }
        //{
        //    _context = context;
        //    _hostingEnvironment = hostingEnvironment;
        //}
        public class JTableModelMaterialImpStoreDetail : JTableModel
        {
            public string ExpCode { get; set; }
            public string StoreName { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }

        }
        public class JTableModelMaterialStoreImpGoodsHeaders : JTableModel
        {
            public string Title { get; set; }
            public string CusCode { get; set; }
            public string StoreCode { get; set; }
            public string UserImport { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ReasonName { get; set; }
        }
        public IActionResult Index()
        {
            return View();
        }

        [NonAction]
        public JsonResult JTable([FromBody]JTableModelMaterialStoreImpGoodsHeaders jTablePara, int userType = 0)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(userType, jTablePara.Title, jTablePara.CusCode, jTablePara.StoreCode, jTablePara.UserImport, jTablePara.FromDate, jTablePara.ToDate, jTablePara.ReasonName);

                var count = query.Count();
                var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.QrTicketCode = CommonUtil.GenerateQRCode(item.TicketCode);
                //}
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserImport", "UserImportName", "UserSend", "Note", "PositionGps", "PositionText", "FromDevice", "InsurantTime", "TimeTicketCreate", "Reason", "ReasonName", "StoreCodeSend", "CreatedBy");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<MaterialStoreImpModel>(), jTablePara.Draw, 0, "Id", "TicketCode", "QrTicketCode", "CusCode", "CusName", "StoreCode", "StoreName", "Title", "UserImport", "UserImportName", "UserSend", "Note", "PositionGps", "PositionText", "FromDevice", "InsurantTime", "TimeTicketCreate", "Reason", "ReasonName", "StoreCodeSend", "CreatedBy");
                return Json(jdata);
            }
        }

        [HttpPost]
        public object GridDataOfUser([FromBody]JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [HttpPost]
        public object GridDataOfBranch([FromBody]JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [HttpPost]
        public object GridDataOfAdmin([FromBody]JTableModelMaterialStoreImpGoodsHeaders jTablePara)
        {
            return JTable(jTablePara, 10);
        }

        [NonAction]
        public IQueryable<MaterialStoreImpModel> FuncJTable(int userType, string Title, string CusCode, string StoreCode, string UserImport, string FromDate, string ToDate, string ReasonName)
        {
            var session = HttpContext.GetSessionUser();

            var fromDate = !string.IsNullOrEmpty(FromDate) ? DateTime.ParseExact(FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(ToDate) ? DateTime.ParseExact(ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = (from a in _context.ProdReceivedHeaders.Where(x => x.IsDeleted != true).AsNoTracking()
                         join c in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals c.WHS_Code
                         join d in _context.Users.Where(x => x.Active) on a.UserImport equals d.UserName
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON") on a.Reason equals e.CodeSet
                         //bỏ những phần liên quan đến tiền
                         //join f in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_PAYMENT_STATUS") on a.PaymentStatus equals f.CodeSet
                         //join g in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)) on a.Currency equals g.CodeSet

                         //field khách hàng trong phiếu nhập chính là nhà cung cấp (hiện tại chưa sửa)
                         join b in _context.Suppliers.Where(x => x.IsDeleted != true) on a.CusCode equals b.SupCode into b1
                         from b2 in b1.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(Title) || (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(Title.ToLower())))
                         && (string.IsNullOrEmpty(CusCode) || (a.CusCode == CusCode))
                         && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                         && (string.IsNullOrEmpty(UserImport) || (a.UserImport == UserImport))
                         && (string.IsNullOrEmpty(FromDate) || (a.TimeTicketCreate >= fromDate))
                         && (string.IsNullOrEmpty(ToDate) || (a.TimeTicketCreate <= toDate))
                         && (string.IsNullOrEmpty(ReasonName) || (a.Reason == ReasonName))

                             //Điều kiện phân quyền dữ liệu
                             && (userType == 10
                                    || (userType == 2 && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                                    || (userType == 0 && session.UserName == a.CreatedBy)
                                )
                         select new MaterialStoreImpModel
                         {
                             Id = a.Id,
                             TicketCode = a.TicketCode,
                             //QrTicketCode = CommonUtil.GeneratorQRCode(a.TicketCode),
                             CusCode = a.CusCode,
                             CusName = b2 != null ? b2.SupName : "",
                             StoreCode = a.StoreCode,
                             StoreName = c.WHS_Name,
                             Title = a.Title,
                             UserImport = a.UserImport,
                             UserImportName = d.GivenName,
                             UserSend = a.UserSend,
                             //CostTotal = a.CostTotal,
                             //Currency = a.Currency,
                             //CurrencyName = g.ValueSet,
                             //Discount = a.Discount,
                             //Commission = a.Commission,
                             //TaxTotal = a.TaxTotal,
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
                             StoreCodeSend = a.StoreCodeSend,
                             //PaymentStatus = a.PaymentStatus,
                             //PaymentStatusName = f.ValueSet,
                             CreatedBy = a.CreatedBy,
                         });
            return query;
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
                        var impODD = _context.ProdReceivedHeaders.Where(x => string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noODD = 1;
                        if (impODD.Count > 0)
                            noODD = noODD + impODD.Count;
                        ticketCode = string.Format("IMP_ODD_T{0}.{1}_{2}", monthNow, yearNow, noODD);
                        break;
                    case "PO":
                        var impPO = _context.ProdReceivedHeaders.Where(x => !string.IsNullOrEmpty(x.LotProductCode)).ToList();
                        var noPO = 1;
                        if (impPO.Count > 0)
                            noPO = noPO + impPO.Count;
                        ticketCode = string.Format("IMP_PO_T{0}.{1}_{2}", monthNow, yearNow, noPO);
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

        [HttpPost]
        public JsonResult CountCoil()
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var no = 1;
                var listCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted).ToList();
                if (listCoil.Count > 0)
                    no = no + listCoil.Count;

                mess.Object = no;
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
        public JsonResult GetItem([FromBody]int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProdReceivedHeaders.Where(x => x.Id == id).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.CusCode,
                    x.Reason,
                    x.StoreCodeSend,
                    x.UserImport,
                    x.Note,
                    x.UserSend,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT")
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                                   join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                   from d2 in d1.DefaultIfEmpty()
                                   join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                   from a in a2.DefaultIfEmpty()
                                   orderby b1.ProductCode
                                   select new
                                   {
                                       ProductCode = g.ProductCode,
                                       ProductName = b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       ProductQrCode = g.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                       Unit = b1.Unit,
                                       UnitName = c1.ValueSet,
                                       //QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                       QuantityOrder = g.Quantity - g.QuantityIsSet,
                                       Quantity = g.Quantity,
                                       QuantityPoCount = a != null ? int.Parse(a.Quantity, 0) : 0,//Lấy ra số lượng từ P0
                                       //QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                       QuantityNeedSet = a != null ? a.QuantityNeedImport : 0,
                                       QuantityIsSet = g.QuantityIsSet,
                                       SalePrice = g.SalePrice,
                                       ProductLot = g.ProductLot,
                                       ProductCoil = g.ProductCoil,
                                       PackType = g.PackType,
                                       ImpType = d2.ValueSet,
                                       ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                       {
                                           k.Id,
                                           k.ProductQrCode,
                                           ProductName = b1.AttributeName,
                                           ProductCoil = k.CoilCode,
                                           ProductCoilRelative = k.CoilRelative,
                                           k.Remain,
                                           k.Size,
                                           k.TicketCode,
                                           k.PackType,
                                           k.PositionInStore,
                                           k.RackCode,
                                           k.RackPosition,
                                           k.CreatedBy,
                                           k.CreatedTime,
                                           k.UpdatedBy,
                                           k.UpdatedTime,
                                           k.UnitCoil,
                                           k.ProductImpType,
                                           k.ProductLot,
                                           IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                       })
                                   })
                                   .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT")
                                           join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                           join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                           from d2 in d1.DefaultIfEmpty()
                                           join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                           from a in a2.DefaultIfEmpty()
                                           orderby b1.ProductCode
                                           select new
                                           {
                                               ProductCode = g.ProductCode,
                                               ProductName = b1.ProductName,
                                               ProductType = "FINISHED_PRODUCT",
                                               ProductQrCode = g.ProductQrCode,
                                               sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                               Unit = b1.Unit,
                                               UnitName = c1.ValueSet,
                                               //QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                               QuantityOrder = g.Quantity - g.QuantityIsSet,
                                               Quantity = g.Quantity,
                                               QuantityPoCount = a != null ? int.Parse(a.Quantity, 0) : 0,//Lấy ra số lượng từ P0
                                               //QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                               QuantityNeedSet = a != null ? a.QuantityNeedImport : 0,
                                               QuantityIsSet = g.QuantityIsSet,
                                               SalePrice = g.SalePrice,
                                               ProductLot = g.ProductLot,
                                               ProductCoil = g.ProductCoil,
                                               PackType = g.PackType,
                                               ImpType = d2.ValueSet,
                                               ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                               {
                                                   k.Id,
                                                   k.ProductQrCode,
                                                   ProductName = b1.ProductName,
                                                   ProductCoil = k.CoilCode,
                                                   ProductCoilRelative = k.CoilRelative,
                                                   k.Remain,
                                                   k.Size,
                                                   k.TicketCode,
                                                   k.PackType,
                                                   k.PositionInStore,
                                                   k.RackCode,
                                                   k.RackPosition,
                                                   k.CreatedBy,
                                                   k.CreatedTime,
                                                   k.UpdatedBy,
                                                   k.UpdatedTime,
                                                   k.UnitCoil,
                                                   k.ProductImpType,
                                                   k.ProductLot,
                                                   IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                               })
                                           });
                foreach (var product in ListProduct)
                {
                    product.ListCoil.OrderBy(x => x.CreatedTime).ThenBy(p => p.IsOrder);
                }
                mess.Object = new { Header = item, ListProduct };
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
        public JsonResult Insert([FromBody]MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                //var isChangePoSup = false;
                var poOldTime = DateTime.Now;
                var chk = _context.ProdReceivedHeaders.Any(x => x.TicketCode.Equals(obj.TicketCode));
                if (!chk)
                {
                    //Insert bảng header
                    var objNew = new ProdReceivedHeader
                    {
                        LotProductCode = obj.LotProductCode,
                        TicketCode = obj.TicketCode,
                        Title = obj.Title,
                        StoreCode = obj.StoreCode,
                        CusCode = obj.CusCode,
                        Reason = obj.Reason,
                        StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "",
                        //CostTotal = obj.CostTotal,
                        //Currency = obj.Currency,
                        //Discount = obj.Discount,
                        //TaxTotal = obj.TaxTotal,
                        //Commission = obj.Commission,
                        //TotalMustPayment = obj.TotalMustPayment,
                        //TotalPayed = obj.TotalPayed,
                        //PaymentStatus = obj.Currency == "CURRENCY_VND"
                        //                        ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "IMP_PAYMENT_STATUS_DEBIT" : "IMP_PAYMENT_STATUS_DONE"
                        //                        : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "IMP_PAYMENT_STATUS_DEBIT" : "IMP_PAYMENT_STATUS_DONE",
                        //NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        UserImport = obj.UserImport,
                        Note = obj.Note,
                        UserSend = obj.UserSend,
                        InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,
                        TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null,

                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                    };
                    _context.ProdReceivedHeaders.Add(objNew);

                    //Xóa bỏ danh sách cũ có cùng ticket code
                    var listRemove = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    if (listRemove.Count() > 0)
                    {
                        foreach (var itemRemove in listRemove)
                        {
                            itemRemove.IsDeleted = true;
                        }
                        _context.ProdPackageReceiveds.UpdateRange(listRemove);
                        _context.ProdPackageReceiveds.Load();
                    }

                    foreach (var item in obj.ListProduct)
                    {
                        foreach (var itemCoil in item.ListCoil)
                        {
                            var prdPackageInfo = _context.ProdPackageReceiveds.ToList();
                            prdPackageInfo = _context.ProdPackageReceiveds.Local.ToList();
                            var noCoil = prdPackageInfo.Count > 0 ? prdPackageInfo.Count + 1 : 1;

                            //Thêm vào bảng PROD_PACKAGE_INFO
                            var size = 0;
                            try
                            {
                                size = !string.IsNullOrEmpty(itemCoil.ValueCoil) ? int.Parse(itemCoil.ValueCoil) : 0;
                                //size = !string.IsNullOrEmpty(itemCoil.sProductCoil) ? int.Parse(itemCoil.sProductCoil.Split("x")[0]) * int.Parse(itemCoil.sProductCoil.Split("x")[1]) : 0;
                            }
                            catch (Exception ex)
                            {

                            }
                            var check = _context.ProdPackageReceiveds.Local.Where(x => x.CoilCode.Equals(itemCoil.ProductCoil)).ToList();
                            var coilCode = itemCoil.ProductCoil;
                            if (check.Count == 0)
                            {
                                coilCode = coilCode + noCoil;
                            }
                            var prodPackageInfo = new ProdPackageReceived
                            {
                                TicketCode = obj.TicketCode,
                                CoilCode = coilCode,
                                Size = size,
                                Remain = size,
                                CoilRelative = itemCoil.ProductCoilRelative,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                PackType = item.PackType,
                                ProductQrCode = item.ProductQrCode,
                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                ProductImpType = itemCoil.ProductImpType,
                                UnitCoil = itemCoil.UnitCoil,
                                ProductLot = itemCoil.ProductLot
                            };

                            _context.ProdPackageReceiveds.Add(prodPackageInfo);
                            _context.ProdPackageReceiveds.Load();
                        }


                        //Insert bảng detail
                        var objNewDetail = new ProdReceivedDetail
                        {
                            LotProductCode = obj.LotProductCode,
                            TicketCode = obj.TicketCode,
                            Currency = obj.Currency,

                            ProductCode = item.ProductCode,
                            ProductType = item.ProductType,
                            ProductQrCode = item.ProductQrCode,
                            Quantity = item.Quantity,
                            QuantityIsSet = 0,
                            Unit = item.Unit,
                            SalePrice = item.SalePrice,
                            //TaxRate = item.TaxRate,
                            //Discount = item.Discount,
                            //Commission = item.Commission,
                            RackCode = item.RackCode,
                            ProductCoil = item.ProductCoil,
                            ProductLot = item.ProductLot,

                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            IsDeleted = false,
                        };
                        _context.ProdReceivedDetails.Add(objNewDetail);

                        //Thêm sản phẩm vào bảng Kho (đoạn check giữ của bên export - không cần thiết vì chắc chắn ra null)
                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
                        if (storeInventory != null)
                        {
                            storeInventory.Quantity = storeInventory.Quantity + item.Quantity;
                            _context.ProductInStocks.Update(storeInventory);
                        }
                        else
                        {
                            var storeInventoryObj = new ProductInStock
                            {
                                LotProductCode = obj.LotProductCode,
                                StoreCode = obj.StoreCode,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                ProductQrCode = item.ProductQrCode,
                                Quantity = item.Quantity,
                                Unit = item.Unit,

                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false
                            };

                            _context.ProductInStocks.Add(storeInventoryObj);
                        }

                        //Thêm lượng tồn của sản phẩm vào bảng Product - Sub Product
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

                        //Thêm vào bảng Product_QrCode
                        var productQrCodeObj = _context.ProductQrCodes.FirstOrDefault(x => x.QrCode.Equals(item.ProductQrCode));
                        if (productQrCodeObj == null)
                        {
                            var prodQrCode = new ProductQrCode
                            {
                                ImpCode = obj.TicketCode,
                                LotCode = obj.LotProductCode,

                                ProductCode = item.ProductCode,
                                QrCode = item.ProductQrCode,
                                Count = 0,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now,
                            };

                            _context.ProductQrCodes.Add(prodQrCode);
                        }

                        //Giảm lượng sản phẩm còn phải nhập trong bảng PO_Product_Detail
                        var poProductDetail = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == obj.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
                        if (poProductDetail != null)
                        {
                            poProductDetail.QuantityNeedImport = poProductDetail.QuantityNeedImport > item.Quantity ? poProductDetail.QuantityNeedImport - item.Quantity : 0;
                            _context.PoBuyerDetails.Update(poProductDetail);
                        }
                    }

                    _context.SaveChanges();
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_ADD_MATERIAL_EXP_STORE_HOURE"));
                    msg.Title = _stringLocalizer["MIS_MSG_ADD_MATERIAL_EXP_STORE_HOURE"];

                    ////Update PO SUP nếu ngày hôm nay != thời hạn trong PO
                    //if (!string.IsNullOrEmpty(objNew.LotProductCode))
                    //{
                    //    var poSup = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == objNew.LotProductCode && x.IsDeleted == false);
                    //    if (poSup != null && poSup.Id > 0 && poSup.EstimateTime.Value.Date != objNew.TimeTicketCreate.Value.Date)
                    //    {
                    //        isChangePoSup = true;
                    //        poOldTime = poSup.EstimateTime.Value.Date;
                    //        poSup.EstimateTime = objNew.TimeTicketCreate.Value.Date;
                    //        _context.PoBuyerHeaders.Update(poSup);
                    //    }
                    //}
                    ////up PO trước nếu có
                    //if (isChangePoSup == true)
                    //{
                    //    string[] param = new string[] { "@ContractCode", "@OldEstimateDate", "@EstimateDate" };
                    //    object[] val = new object[] { objNew.LotProductCode, poOldTime, objNew.TimeTicketCreate.Value.Date };
                    //    _repositoryService.CallProc("PR_UPDATE_BUYER_HEADER", param, val);
                    //}

                    foreach (var item in obj.ListProduct)
                    {
                        string[] param = new string[] { "@ProductCode", "@Quantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { item.ProductCode, item.Quantity, item.ProductType, obj.LotProductCode, objNew.TimeTicketCreate };
                        _repositoryService.CallProc("PR_INSERT_STORE_IMP_DETAIL", param, val);
                    }

                    var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                    var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail
                        };

                        var listLogData = new List<object>();
                        listLogData.Add(logData);

                        header.LogData = JsonConvert.SerializeObject(listLogData);

                        _context.ProdReceivedHeaders.Update(header);
                        _context.SaveChanges();
                    }

                    msg.ID = header.Id;
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_MATERIAL_IMPORT_WARE_HOURE"));
                    msg.Title = _stringLocalizer["MIS_MSG_MATERIAL_IMPORT_WARE_HOURE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE"));
                msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE"];
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]MaterialStoreImpModelInsert obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var poOldTime = DateTime.Now;
                var objUpdate = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode));
                if (objUpdate != null)
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                    join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();

                    //Check xem sản phẩm đã được xếp kho thì không cho sửa kho nhập
                    var chkOrdering = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode)
                                       join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                       select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE_EXPORT"));
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_ADD_IMPORT_WARE_HOURE_EXPORT"];
                    }
                    else if (chkOrdering && !objUpdate.StoreCode.Equals(obj.StoreCode))
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("Sản phẩm đã được xếp kho không được sửa kho nhập"));

                    }
                    else
                    {
                        var oldTimeTicketCreate = objUpdate.TimeTicketCreate;

                        //Update bảng header
                        objUpdate.LotProductCode = obj.LotProductCode;
                        objUpdate.TicketCode = obj.TicketCode;
                        objUpdate.Title = obj.Title;
                        objUpdate.StoreCode = obj.StoreCode;
                        objUpdate.CusCode = obj.CusCode;
                        objUpdate.Reason = obj.Reason;
                        objUpdate.StoreCodeSend = obj.Reason == "IMP_FROM_MOVE_STORE" ? obj.StoreCodeSend : "";
                        //objUpdate.CostTotal = obj.CostTotal;
                        //objUpdate.Currency = obj.Currency;
                        //objUpdate.Discount = obj.Discount;
                        //objUpdate.TaxTotal = obj.TaxTotal;
                        //objUpdate.Commission = obj.Commission;
                        //objUpdate.TotalMustPayment = obj.TotalMustPayment;
                        //objUpdate.TotalPayed = obj.TotalPayed;
                        //objUpdate.PaymentStatus = obj.Currency == "CURRENCY_VND"
                        //                        ? (obj.TotalMustPayment / 1000) > ((obj.TotalPayed / 1000) + 1) ? "IMP_PAYMENT_STATUS_DEBIT" : "IMP_PAYMENT_STATUS_DONE"
                        //                        : obj.TotalMustPayment > (obj.TotalPayed + 1) ? "IMP_PAYMENT_STATUS_DEBIT" : "IMP_PAYMENT_STATUS_DONE";
                        //objUpdate.NextTimePayment = !string.IsNullOrEmpty(obj.NextTimePayment) ? DateTime.ParseExact(obj.NextTimePayment, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        objUpdate.UserImport = obj.UserImport;
                        objUpdate.Note = obj.Note;
                        objUpdate.UserSend = obj.UserSend;
                        objUpdate.InsurantTime = !string.IsNullOrEmpty(obj.InsurantTime) ? DateTime.ParseExact(obj.InsurantTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                        objUpdate.TimeTicketCreate = !string.IsNullOrEmpty(obj.TimeTicketCreate) ? DateTime.ParseExact(obj.TimeTicketCreate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                        objUpdate.UpdatedBy = ESEIM.AppContext.UserName;
                        objUpdate.UpdatedTime = DateTime.Now;

                        _context.ProdReceivedHeaders.Update(objUpdate);


                        //Xử lý list cũ trước
                        //xóa detail
                        var listDetail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == obj.TicketCode).ToList();
                        listDetail.ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.DeletedBy = ESEIM.AppContext.UserName;
                            x.DeletedTime = DateTime.Now;
                        });
                        _context.ProdReceivedDetails.UpdateRange(listDetail);

                        foreach (var item in listDetail)
                        {
                            //sửa lại kho
                            var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
                            if (storeInventory != null)
                            {
                                storeInventory.IsDeleted = true;
                                _context.ProductInStocks.Update(storeInventory);
                            }
                            else
                            {
                                //msg.Error = true;
                                //msg.Title = "Không tìm được sản phẩm " + item.ProductQrCode + " trong kho.";
                                //return Json(msg);
                            }

                            //Giảm lượng tồn của sản phẩm trong bảng Product - Sub Product
                            if (item.ProductType == "SUB_PRODUCT")
                            {
                                var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.AttributeCode == item.ProductCode);
                                if (subProduct != null)
                                {
                                    subProduct.InStock = subProduct.InStock == null || subProduct.InStock < item.Quantity ? 0 : subProduct.InStock - item.Quantity;
                                    _context.SubProducts.Update(subProduct);
                                }
                            }
                            else if (item.ProductType == "FINISHED_PRODUCT")
                            {
                                var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                                if (product != null)
                                {
                                    product.InStock = product.InStock == null || product.InStock < item.Quantity ? 0 : product.InStock - item.Quantity;
                                    _context.MaterialProducts.Update(product);
                                }
                            }

                            //Xóa các sản phẩm trong bảng Mapping (các sản phẩm không trong list mới)
                            var mapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode) && obj.ListProduct.All(y => y.ProductQrCode != item.ProductQrCode)).ToList();
                            mapping.ForEach(x =>
                            {
                                x.IsDeleted = true;
                            });
                            _context.ProductEntityMappings.UpdateRange(mapping);


                            //Xóa các sản phẩm trong bảng Product_QrCode  
                            var productQrCodeObj = _context.ProductQrCodes.FirstOrDefault(x => x.QrCode.Equals(item.ProductQrCode));
                            if (productQrCodeObj != null)
                            {
                                _context.ProductQrCodes.Remove(productQrCodeObj);
                            }

                            //Trả lại lượng sản phẩm còn phải nhập trong bảng PO_Product_Detail
                            var poProductDetail = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == objUpdate.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedImport = poProductDetail.QuantityNeedImport + item.Quantity;
                                _context.PoBuyerDetails.Update(poProductDetail);
                            }

                        }

                        _context.SaveChanges();
                        //
                        foreach (var item in listDetail)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, obj.LotProductCode, oldTimeTicketCreate };
                            _repositoryService.CallProc("PR_UPDATE_STORE_IMP_DETAIL", param, val);
                        }

                        //Xóa bỏ danh sách cũ có cùng ticket code
                        var listRemove = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        if (listRemove.Count() > 0)
                        {
                            foreach (var itemRemove in listRemove)
                            {
                                itemRemove.IsDeleted = true;
                            }
                            _context.ProdPackageReceiveds.UpdateRange(listRemove);
                            _context.ProdPackageReceiveds.Load();
                        }

                        //Insert list detail mới vào
                        foreach (var item in obj.ListProduct)
                        {
                            foreach (var itemCoil in item.ListCoil)
                            {
                                var prdPackageInfo = _context.ProdPackageReceiveds.Local.ToList();
                                var noCoil = prdPackageInfo.Count > 0 ? prdPackageInfo.Count + 1 : 1;

                                //Thêm vào bảng WAREHOURSE_COIL_INFO
                                decimal? size = 0;
                                try
                                {
                                    size = !string.IsNullOrEmpty(itemCoil.ValueCoil) ? decimal.Parse(itemCoil.ValueCoil) : 0;
                                    //size = !string.IsNullOrEmpty(itemCoil.sProductCoil) ? int.Parse(itemCoil.sProductCoil.Split("x")[0]) * int.Parse(itemCoil.sProductCoil.Split("x")[1]) : 0;
                                }
                                catch (Exception ex)
                                {

                                }
                                var check = _context.ProdPackageReceiveds.LastOrDefault(x => x.CoilCode.Equals(itemCoil.ProductCoil));
                                var coilCode = itemCoil.ProductCoil;
                                decimal? remain = 0;
                                if (check == null)
                                {
                                    remain = size;
                                    coilCode = coilCode + noCoil;
                                }
                                else
                                {
                                    itemCoil.RackCode = check.RackCode;
                                    itemCoil.RackPosition = check.RackPosition;
                                    itemCoil.PositionInStore = check.PositionInStore;
                                    remain = check.Remain;
                                }
                                var prodPackageInfo = new ProdPackageReceived
                                {
                                    Id = 0,
                                    TicketCode = obj.TicketCode,
                                    CoilCode = coilCode,
                                    Size = size,
                                    Remain = remain,
                                    CoilRelative = itemCoil.ProductCoilRelative,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    PackType = item.PackType,
                                    ProductQrCode = item.ProductQrCode,
                                    ProductCode = item.ProductCode,
                                    ProductType = item.ProductType,
                                    ProductImpType = itemCoil.ProductImpType,
                                    UnitCoil = itemCoil.UnitCoil,
                                    ProductLot = itemCoil.ProductLot,
                                    RackCode = itemCoil.RackCode,
                                    RackPosition = itemCoil.RackPosition,
                                    PositionInStore = itemCoil.PositionInStore,
                                };

                                _context.ProdPackageReceiveds.Add(prodPackageInfo);
                                _context.ProdPackageReceiveds.Load();
                            }

                            //Trả lại lượng sản phẩm trong bảng MATERIAL_STORE_IMP_GOODS_DETAIL
                            var materialImpDetail = _context.ProdReceivedDetails.LastOrDefault(x => x.ProductQrCode == item.ProductQrCode && x.ProductType == item.ProductType);
                            decimal quantityIsSet = 0;
                            if (materialImpDetail != null)
                            {
                                quantityIsSet = materialImpDetail.QuantityIsSet;
                            }

                            //Insert bảng detail
                            var objNewDetail = new ProdReceivedDetail
                            {
                                LotProductCode = obj.LotProductCode,
                                TicketCode = obj.TicketCode,
                                Currency = obj.Currency,

                                ProductCode = item.ProductCode,
                                ProductType = item.ProductType,
                                ProductQrCode = item.ProductQrCode,
                                Quantity = item.Quantity,
                                QuantityIsSet = quantityIsSet,
                                Unit = item.Unit,
                                SalePrice = item.SalePrice,
                                //TaxRate = item.TaxRate,
                                //Discount = item.Discount,
                                //Commission = item.Commission,
                                RackCode = item.RackCode,
                                //ProductCoil = item.ProductCoil,
                                ProductLot = item.ProductLot,
                                PackType = item.PackType,

                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                IsDeleted = false,
                            };
                            _context.ProdReceivedDetails.Add(objNewDetail);

                            //Thêm vào bảng WAREHOURSE_COIL_INFO

                            //Mã COIL_CODE=TICKET_CODE+PRODUCT_CODE+PRODUCT_LOT+PRODUCT_COIL
                            //var coilCode = string.Format("{0}_{1}_{2}_{3}", obj.TicketCode, item.ProductCode, item.ProductLot, item.ProductCoil);

                            //var size = 0;
                            //try
                            //{
                            //    size = !string.IsNullOrEmpty(item.ProductCoil) ? int.Parse(item.ProductCoil.Split("x")[0]) * int.Parse(item.ProductCoil.Split("x")[1]) : 0;
                            //}
                            //catch (Exception ex)
                            //{
                            //    throw ex;
                            //}

                            //var prodPackageInfo = new WarehouseCoilInfo
                            //{
                            //    TicketCode = obj.TicketCode,
                            //    CoilCode = coilCode,
                            //    SizeM2 = size,
                            //    RemainM2 = size,
                            //    CreatedBy = User.Identity.Name,
                            //    CreatedTime = DateTime.Now
                            //};

                            //_context.WarehouseCoilInfos.Add(prodPackageInfo);

                            //Thêm sản phẩm vào bảng Kho (đoạn check giữ của bên export - không cần thiết vì chắc chắn ra null)
                            var storeInventoryNew = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
                            if (storeInventoryNew != null)
                            {
                                storeInventoryNew.Quantity = storeInventoryNew.Quantity + item.Quantity;
                                _context.ProductInStocks.Update(storeInventoryNew);
                            }
                            else
                            {
                                var storeInventoryObj = new ProductInStock
                                {
                                    LotProductCode = obj.LotProductCode,
                                    StoreCode = obj.StoreCode,

                                    ProductCode = item.ProductCode,
                                    ProductType = item.ProductType,
                                    ProductQrCode = item.ProductQrCode,
                                    Quantity = item.Quantity,
                                    Unit = item.Unit,

                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    UpdatedBy = ESEIM.AppContext.UserName,
                                    UpdatedTime = DateTime.Now,
                                    IsDeleted = false
                                };

                                _context.ProductInStocks.Add(storeInventoryObj);
                            }

                            //Thêm lượng tồn của sản phẩm vào bảng Product - Sub Product
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

                            //Thêm vào bảng Product_QrCode
                            var productQrCodeObjNew = _context.ProductQrCodes.FirstOrDefault(x => x.QrCode.Equals(item.ProductQrCode));
                            if (productQrCodeObjNew == null)
                            {
                                var prodQrCode = new ProductQrCode
                                {
                                    ImpCode = obj.TicketCode,
                                    LotCode = obj.LotProductCode,

                                    ProductCode = item.ProductCode,
                                    QrCode = item.ProductQrCode,
                                    Count = 0,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now,
                                    UpdatedBy = ESEIM.AppContext.UserName,
                                    UpdatedTime = DateTime.Now,
                                };

                                _context.ProductQrCodes.Add(prodQrCode);
                            }

                            //Giảm lượng sản phẩm còn phải nhập trong bảng PO_Product_Detail
                            var poProductDetail = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == obj.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
                            if (poProductDetail != null)
                            {
                                poProductDetail.QuantityNeedImport = poProductDetail.QuantityNeedImport > item.Quantity ? poProductDetail.QuantityNeedImport - item.Quantity : 0;
                                _context.PoBuyerDetails.Update(poProductDetail);
                            }
                        }

                        _context.SaveChanges();
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_EDIT_ERROR_SUCCESS"));
                        msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], "");
                        foreach (var item in obj.ListProduct)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                            object[] val = new object[] { item.ProductCode, 0, item.Quantity, item.ProductType, obj.LotProductCode, objUpdate.TimeTicketCreate };
                            _repositoryService.CallProc("PR_UPDATE_STORE_IMP_DETAIL", param, val);
                        }

                        var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode)).ToList();
                        if (header != null)
                        {
                            var logData = new
                            {
                                Header = header,
                                Detail = detail
                            };

                            var listLogData = new List<object>();

                            if (!string.IsNullOrEmpty(header.LogData))
                            {
                                listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                                logData.Header.LogData = null;
                                listLogData.Add(logData);
                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdReceivedHeaders.Update(header);
                                _context.SaveChanges();
                            }
                            else
                            {
                                listLogData.Add(logData);

                                header.LogData = JsonConvert.SerializeObject(listLogData);

                                _context.ProdReceivedHeaders.Update(header);
                                _context.SaveChanges();
                            }
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_CODE_EXITS"));
                    msg.Title = _stringLocalizer["MIS_MSG_CODE_EXITS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_ERRO_EDIT_IMPORT_WARE_HOURE"));
                msg.Title = _stringLocalizer["MIS_MSG_ERRO_EDIT_IMPORT_WARE_HOURE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;

                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("MIS_TITLE_INFORMATION_SHIPMENT"));
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["MIS_TITLE_INFORMATION_SHIPMENT"]);
                }
                else
                {
                    //Check xem sản phẩm đã được đưa vào phiếu xuất kho chưa
                    var chkUsing = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                    join b in _context.ProdDeliveryDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals b.ProductQrCode
                                    select a.Id).Any();
                    if (chkUsing)
                    {
                        msg.Error = true;
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"));
                        msg.Title = _stringLocalizer["MIS_MSG_ERRO_DELTE_IMPORT_WARE_HOURE"];
                        return Json(msg);
                    }

                    //Check xem sản phẩm đã được xếp kho chưa
                    var chkMapping = (from a in _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode)
                                      join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.Quantity > 0) on a.ProductQrCode equals b.ProductQrCode
                                      select a.Id).Any();
                    if (chkMapping)
                    {
                        msg.Error = true;
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NOT_DELETE")); //"Không xóa được phiếu xuất kho có tồn tại sản phẩm đã được xếp kho!";
                        msg.Title = _stringLocalizer["MIS_MSG_NOT_DELETE"];
                        return Json(msg);
                    }

                    //xóa header
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.ProdReceivedHeaders.Update(data);

                    //xóa detail
                    var listDetail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode == data.TicketCode).ToList();
                    listDetail.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = ESEIM.AppContext.UserName;
                        x.DeletedTime = DateTime.Now;
                    });
                    _context.ProdReceivedDetails.UpdateRange(listDetail);

                    foreach (var item in listDetail)
                    {
                        //sửa lại kho
                        var storeInventory = _context.ProductInStocks.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode));
                        if (storeInventory != null)
                        {
                            storeInventory.IsDeleted = true;
                            _context.ProductInStocks.Update(storeInventory);
                        }
                        else
                        {
                            //msg.Error = true;
                            //msg.Title = "Không tìm được sản phẩm " + item.ProductQrCode + " trong kho.";
                            //return Json(msg);
                        }

                        //Giảm lượng tồn của sản phẩm trong bảng Product - Sub Product
                        if (item.ProductType == "SUB_PRODUCT")
                        {
                            var subProduct = _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.AttributeCode == item.ProductCode);
                            if (subProduct != null)
                            {
                                subProduct.InStock = subProduct.InStock == null || subProduct.InStock < item.Quantity ? 0 : subProduct.InStock - item.Quantity;
                                _context.SubProducts.Update(subProduct);
                            }
                        }
                        else if (item.ProductType == "FINISHED_PRODUCT")
                        {
                            var product = _context.MaterialProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductCode == item.ProductCode);
                            if (product != null)
                            {
                                product.InStock = product.InStock == null || product.InStock < item.Quantity ? 0 : product.InStock - item.Quantity;
                                _context.MaterialProducts.Update(product);
                            }
                        }

                        //Xóa các sản phẩm trong bảng Mapping  
                        var mapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(item.ProductQrCode)).ToList();
                        mapping.ForEach(x =>
                        {
                            x.IsDeleted = true;
                        });
                        _context.ProductEntityMappings.UpdateRange(mapping);


                        //Xóa các sản phẩm trong bảng Product_QrCode  
                        var productQrCodeObj = _context.ProductQrCodes.FirstOrDefault(x => x.QrCode.Equals(item.ProductQrCode));
                        if (productQrCodeObj != null)
                        {
                            _context.ProductQrCodes.Remove(productQrCodeObj);
                        }

                        //Trả lại lượng sản phẩm còn phải nhập trong bảng PO_Product_Detail
                        var poProductDetail = _context.PoBuyerDetails.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == data.LotProductCode && x.ProductCode == item.ProductCode && x.ProductType == item.ProductType);
                        if (poProductDetail != null)
                        {
                            poProductDetail.QuantityNeedImport = poProductDetail.QuantityNeedImport + item.Quantity;
                            _context.PoBuyerDetails.Update(poProductDetail);
                        }
                    }

                    _context.SaveChanges();
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_DELETE_ERRO_SUCCESS"));/*String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_SHIPMENT"))*/
                    msg.Title = _stringLocalizer["MIS_MSG_DELETE_ERRO_SUCCESS"];
                    foreach (var item in listDetail)
                    {
                        string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@LotProductCode", "@CreatedDate" };
                        object[] val = new object[] { item.ProductCode, item.Quantity, 0, item.ProductType, item.LotProductCode, data.TimeTicketCreate };
                        _repositoryService.CallProc("PR_UPDATE_STORE_IMP_DETAIL", param, val);
                    }

                    var header = _context.ProdReceivedHeaders.FirstOrDefault(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode));
                    var detail = _context.ProdReceivedDetails.Where(x => !x.IsDeleted && x.TicketCode.Equals(data.TicketCode)).ToList();
                    if (header != null)
                    {
                        var logData = new
                        {
                            Header = header,
                            Detail = detail
                        };

                        var listLogData = new List<object>();

                        if (!string.IsNullOrEmpty(header.LogData))
                        {
                            listLogData = JsonConvert.DeserializeObject<List<object>>(header.LogData);
                            logData.Header.LogData = null;
                            listLogData.Add(logData);
                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdReceivedHeaders.Update(header);
                            _context.SaveChanges();
                        }
                        else
                        {
                            listLogData.Add(logData);

                            header.LogData = JsonConvert.SerializeObject(listLogData);

                            _context.ProdReceivedHeaders.Update(header);
                            _context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_DELETE_ERRO_FAIL"));/*String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("MES_TITLE_INFORMATION_SHIPMENT"));*/
                msg.Title = _stringLocalizer["MIS_MSG_DELETE_ERRO_FAIL"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetListCoilByProdQrCode(string ticketCode, string productQrCode)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var item = _context.ProdReceivedHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
                {
                    x.LotProductCode,
                    x.TicketCode,
                    x.Title,
                    x.StoreCode,
                    x.CusCode,
                    x.Reason,
                    x.StoreCodeSend,
                    x.UserImport,
                    x.Note,
                    x.UserSend,
                    InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                    TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                }).FirstOrDefault();

                var ListProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "SUB_PRODUCT" && y.ProductQrCode == productQrCode)
                                   join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                                   join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                   from c1 in c2.DefaultIfEmpty()
                                   join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                   from d2 in d1.DefaultIfEmpty()
                                   join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                   from a in a2.DefaultIfEmpty()
                                   orderby b1.ProductCode
                                   select new
                                   {
                                       ProductCode = g.ProductCode,
                                       ProductName = b1.AttributeName,
                                       ProductType = "SUB_PRODUCT",
                                       ProductQrCode = g.ProductQrCode,
                                       sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                       Unit = b1.Unit,
                                       UnitName = c1.ValueSet,
                                       QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                       Quantity = g.Quantity,
                                       QuantityPoCount = int.Parse(a.Quantity, 0),//Lấy ra số lượng từ P0
                                       QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                       QuantityIsSet = g.QuantityIsSet,
                                       SalePrice = g.SalePrice,
                                       ProductLot = g.ProductLot,
                                       ProductCoil = g.ProductCoil,
                                       PackType = g.PackType,
                                       ImpType = d2.ValueSet,
                                       ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                       {
                                           k.Id,
                                           k.ProductQrCode,
                                           ProductName = b1.AttributeName,
                                           ProductCoil = k.CoilCode,
                                           ProductCoilRelative = k.CoilRelative,
                                           k.Remain,
                                           k.Size,
                                           k.TicketCode,
                                           k.PackType,
                                           k.PositionInStore,
                                           k.RackCode,
                                           k.RackPosition,
                                           k.CreatedBy,
                                           k.CreatedTime,
                                           k.UpdatedBy,
                                           k.UpdatedTime,
                                           k.UnitCoil,
                                           k.ProductImpType,
                                           k.ProductLot,
                                           IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                       })
                                   })
                                   .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == item.TicketCode && y.ProductType == "FINISHED_PRODUCT" && y.ProductQrCode == productQrCode)
                                           join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                           join c in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c.CodeSet into c2
                                           from c1 in c2.DefaultIfEmpty()
                                           join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                           from d2 in d1.DefaultIfEmpty()
                                           join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                           from a in a2.DefaultIfEmpty()
                                           orderby b1.ProductCode
                                           select new
                                           {
                                               ProductCode = g.ProductCode,
                                               ProductName = b1.ProductName,
                                               ProductType = "FINISHED_PRODUCT",
                                               ProductQrCode = g.ProductQrCode,
                                               sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                               Unit = b1.Unit,
                                               UnitName = c1.ValueSet,
                                               QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                               Quantity = g.Quantity,
                                               QuantityPoCount = int.Parse(a.Quantity, 0),//Lấy ra số lượng từ P0
                                               QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                               QuantityIsSet = g.QuantityIsSet,
                                               SalePrice = g.SalePrice,
                                               ProductLot = g.ProductLot,
                                               ProductCoil = g.ProductCoil,
                                               PackType = g.PackType,
                                               ImpType = d2.ValueSet,
                                               ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                               {
                                                   k.Id,
                                                   k.ProductQrCode,
                                                   ProductName = b1.ProductName,
                                                   ProductCoil = k.CoilCode,
                                                   ProductCoilRelative = k.CoilRelative,
                                                   k.Remain,
                                                   k.Size,
                                                   k.TicketCode,
                                                   k.PackType,
                                                   k.PositionInStore,
                                                   k.RackCode,
                                                   k.RackPosition,
                                                   k.CreatedBy,
                                                   k.CreatedTime,
                                                   k.UpdatedBy,
                                                   k.UpdatedTime,
                                                   k.UnitCoil,
                                                   k.ProductImpType,
                                                   k.ProductLot,
                                                   IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                               })
                                           });
                var ListCoil = ListProduct.FirstOrDefault() != null ? ListProduct.FirstOrDefault().ListCoil.OrderBy(x => x.CreatedTime).ThenBy(p => p.RackCode) : null;
                mess.Object = new { Header = item, ListCoil };
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
        public JsonResult GetUpdateLog(string ticketCode)
        {
            var msg = new JMessage();
            var data = _context.ProdReceivedHeaders.FirstOrDefault(x => x.TicketCode == ticketCode && x.IsDeleted == false);
            if (data != null)
            {
                if (!string.IsNullOrEmpty(data.LogData))
                    msg.Object = data.LogData;
            }

            return Json(msg);
        }

        #region Get thông tin chung
        [HttpPost]
        public object GetListLotProduct()
        {
            //Giờ lấy theo lô hàng mua về để nhập kho (phiếu đặt hàng Supplier)
            var rs = (from a in _context.PoBuyerHeaderNotDones
                      orderby a.Id descending
                      select new
                      {
                          Code = a.PoSupCode,
                          Name = a.PoSupCode,//Vì bỏ Title nên lấy mã Code hiển thị
                      }).ToList();
            return rs;
        }
        [HttpPost]
        public object GetListLotProduct4Update(string lotProductCode)
        {
            //Giờ lấy theo lô hàng mua về để nhập kho (phiếu đặt hàng Supplier)
            var rs1 = (from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle,
                       });
            var rs2 = (from a in _context.PoBuyerHeaderNotDones.Where(x => x.PoSupCode != lotProductCode)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle,
                       });
            return rs1.Concat(rs2);
        }

        [HttpPost]
        public object GetListStore()
        {
            var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").OrderBy(x => x.WHS_Name).Select(x => new { Code = x.WHS_Code, Name = x.WHS_Name });
            return rs;
        }
        //Đối với phiếu nhập kho thì khách hàng chuyển thành Nhà cung cấp (hiện vẫn giữ tên field & API theo khách hàng, chỉ thay đổi Bảng gọi ra)
        [HttpPost]
        public object GetListCustomer()
        {
            var rs = _context.Suppliers.Where(x => !x.IsDeleted).OrderBy(x => x.SupName).Select(x => new { Code = x.SupCode, Name = x.SupName });
            return rs;
        }
        [HttpPost]
        public object GetListUserImport()
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
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_REASON").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListCurrency()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.CurrencyType)).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListProductRelative()
        {
            var rs = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted)
                     join b in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on new { a.TicketCode, a.ProductQrCode } equals new { b.TicketCode, b.ProductQrCode }
                     select new
                     {
                         Code = a.CoilCode,
                         a.CoilRelative,
                         b.ProductCode,
                         b.ProductQrCode,
                         a.TicketCode,
                         Name = a.CoilCode,
                         b.SalePrice,
                         b.Quantity,
                         b.ProductLot
                     };
            return rs;
        }
        [HttpPost]
        public object GetListProduct()
        {
            var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b.ImpType equals d.CodeSet into d1
                     from d2 in d1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                         Code = b.ProductQrCode,
                         Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                         Unit = b.Unit,
                         ProductCode = b.ProductQrCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                         ImpType = d2.ValueSet
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b.ImpType equals d.CodeSet into d1
                      from d2 in d1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                          ImpType = d2.ValueSet
                      };

            return rs1.Concat(rs);
        }
        public object GetListProductByStore(string storeCode)
        {


            var rs = from a in _context.ProductInStocks.Where(x => x.ProductType == "FINISHED_PRODUCT")

                     from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                         Code = b.ProductQrCode,
                         Name = string.Format("{0}-{1}_{2}", _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => p.ProductCode.Equals(b.ProductCode)).ProductName : null, b.ProductCode, b.AttributeCode),
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          //Code = string.Format("{0}_{1}", b.ProductCode, b.AttributeCode),
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm_{0}-{1}", b.ProductName, b.ProductCode),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                      };

            return rs1.Concat(rs);
        }
        //[HttpPost]
        //public object GetListRackCode(string productQrCode)
        //{
        //    var rs = from a in _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode == productQrCode)
        //             join b in _context.EDMSRacks on a.RackCode equals b.RackCode
        //             join c in _context.EDMSLines on b.LineCode equals c.LineCode
        //             join d in _context.EDMSFloors on c.FloorCode equals d.FloorCode
        //             let name = d.FloorName + " - " + c.L_Text + " - " + b.RackName
        //             orderby name
        //             select new
        //             {
        //                 Code = a.RackCode,
        //                 Name = name,
        //                 Quantity = a.Quantity,
        //             };
        //    return rs;
        //}
        //[HttpPost]
        //public object GetSalePrice(string qrCode)
        //{
        //    var rs = (from a in _context.ProductCostDetails.Where(x => !x.IsDeleted && x.LotProductCode == qrCode)
        //              join b in _context.ProductCostHeaders.Where(x => !x.IsDeleted && x.EffectiveDate <= DateTime.Now && x.ExpiryDate >= DateTime.Now) on a.HeaderCode equals b.HeaderCode
        //              select new
        //              {
        //                  SalePrice = a.Price,
        //                  TaxRate = a.Tax,
        //                  Discount = a.Discount,
        //                  Commission = a.Commission,
        //              }).FirstOrDefault();
        //    return rs;
        //}
        [HttpPost]
        public object GetListUnit()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted).OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }
        [HttpPost]
        public object GetListPaymentStatus()
        {
            var rs = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "IMP_PAYMENT_STATUS").OrderBy(x => x.ValueSet).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return rs;
        }

        //Hướng mới - nhập kho từ lô sản phẩm được đặt hàng mua về (PO_Supplier)
        [HttpPost]
        public object GetLotProduct(string lotProductCode)
        {
            var today = DateTime.Now.ToString("ddMMyyyy-HHmm");

            var ListProduct = (from a1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                               join a in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a1.PoSupCode equals a.PoSupCode
                               join b1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductCode
                               join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.Unit equals c1.CodeSet into c2
                               from c1 in c2.DefaultIfEmpty()
                               join d in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                               from d2 in d1.DefaultIfEmpty()
                               let productQrCode = a.ProductCode + "_0_" + a.PoSupCode + "_T." + today
                               orderby b1.ProductName
                               select new
                               {
                                   ProductCode = a.ProductCode,
                                   ProductName = b1.ProductName,
                                   ProductType = "FINISHED_PRODUCT",
                                   ProductQrCode = productQrCode,
                                   sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                   Unit = b1.Unit,
                                   UnitName = (c1 != null ? c1.ValueSet : ""),
                                   QuantityOrder = 0,
                                   //Quantity = a.Quantity,
                                   Quantity = 0,
                                   QuantityPoCount = int.Parse(a.Quantity, 0),
                                   SalePrice = a.UnitPrice != null ? a.UnitPrice : 0,
                                   //QuantityIsSet = decimal.Parse(a.Quantity) - a.QuantityNeedImport,
                                   QuantityIsSet = 0,
                                   QuantityNeedSet = a.QuantityNeedImport,
                                   QuantityNeedOrder = 0,
                                   sQuantityCoil = 0,
                                   ImpType = d2.ValueSet,
                                   ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).Select(k => new
                                   {
                                       k.Id,
                                       k.ProductQrCode,
                                       ProductCoil = k.CoilCode,
                                       ProductCoilRelative = k.CoilRelative,
                                       k.Remain,
                                       k.Size,
                                       k.TicketCode,
                                       k.PackType,
                                       k.PositionInStore,
                                       k.RackCode,
                                       k.RackPosition,
                                       k.CreatedBy,
                                       k.CreatedTime,
                                       k.UpdatedBy,
                                       k.UpdatedTime,
                                       IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                   })
                               })
                               .Concat(from a1 in _context.PoBuyerHeaders.Where(x => !x.IsDeleted && x.PoSupCode == lotProductCode)
                                       join a in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a1.PoSupCode equals a.PoSupCode
                                       join b1 in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b1.ProductQrCode
                                       join c1 in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.Unit equals c1.CodeSet into c2
                                       from c1 in c2.DefaultIfEmpty()
                                       join d in _context.CommonSettings.Where(x => !x.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                       from d2 in d1.DefaultIfEmpty()
                                       let productQrCode = a.ProductCode + "_" + b1.AttributeCode + "_" + a.PoSupCode + "_T." + today
                                       orderby b1.AttributeName
                                       select new
                                       {
                                           ProductCode = a.ProductCode,
                                           ProductName = b1.AttributeName,
                                           ProductType = "SUB_PRODUCT",
                                           ProductQrCode = productQrCode,
                                           sProductQrCode = CommonUtil.GeneratorQRCode(productQrCode),
                                           Unit = b1.Unit,
                                           UnitName = (c1 != null ? c1.ValueSet : ""),
                                           QuantityOrder = 0,
                                           //Quantity = a.Quantity,
                                           Quantity = 0,
                                           QuantityPoCount = int.Parse(a.Quantity, 0),
                                           SalePrice = a.UnitPrice != null ? a.UnitPrice : 0,
                                           //QuantityIsSet = decimal.Parse(a.Quantity) - a.QuantityNeedImport,
                                           QuantityIsSet = 0,
                                           QuantityNeedSet = a.QuantityNeedImport,
                                           QuantityNeedOrder = 0,
                                           sQuantityCoil = 0,
                                           ImpType = d2.ValueSet,
                                           ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).Select(k => new
                                           {
                                               k.Id,
                                               k.ProductQrCode,
                                               ProductCoil = k.CoilCode,
                                               ProductCoilRelative = k.CoilRelative,
                                               k.Remain,
                                               k.Size,
                                               k.TicketCode,
                                               k.PackType,
                                               k.PositionInStore,
                                               k.RackCode,
                                               k.RackPosition,
                                               k.CreatedBy,
                                               k.CreatedTime,
                                               k.UpdatedBy,
                                               k.UpdatedTime,
                                               IsOrder = !string.IsNullOrEmpty(k.RackCode) ? true : false
                                           })
                                       });

            var SupCode = _context.PoBuyerHeaders.FirstOrDefault(x => !x.IsDeleted && x.PoSupCode == lotProductCode)?.SupCode;

            return new { ListProduct, SupCode = SupCode };
        }
        [HttpGet]
        public object GetListProductInStore(string rackCode)
        {
            try
            {
                var prodMapping = _context.ProductEntityMappingLogs.AsParallel().Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode)).ToList();
                var query2 = (from a in prodMapping
                              join b in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
                              join c1 in _context.SubProducts.Where(x => !x.IsDeleted) on b.ProductCode equals c1.ProductQrCode into c2
                              from c in c2.DefaultIfEmpty()
                              join d in _context.Users on a.CreatedBy equals d.UserName into d1
                              from d2 in d1.DefaultIfEmpty()
                              select new
                              {
                                  a.Id,
                                  a.WHS_Code,
                                  a.FloorCode,
                                  a.LineCode,
                                  a.Ordering,
                                  a.ProductQrCode,
                                  a.RackCode,
                                  a.RackPosition,
                                  a.Quantity,
                                  a.Unit,
                                  c.AttributeName,
                                  CreatedBy = d2.GivenName,
                                  CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : null,
                              });
                var query1 = (from a in prodMapping
                              join b in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT") on a.ProductQrCode equals b.ProductQrCode
                              join c1 in _context.MaterialProducts.Where(x => !x.IsDeleted) on b.ProductCode equals c1.ProductCode into c2
                              from c in c2.DefaultIfEmpty()
                              join d in _context.Users on a.CreatedBy equals d.UserName into d1
                              from d2 in d1.DefaultIfEmpty()
                              select new
                              {
                                  a.Id,
                                  a.WHS_Code,
                                  a.FloorCode,
                                  a.LineCode,
                                  a.Ordering,
                                  a.ProductQrCode,
                                  a.RackCode,
                                  a.RackPosition,
                                  a.Quantity,
                                  a.Unit,
                                  AttributeName = c.ProductName,
                                  CreatedBy = d2.GivenName,
                                  CreatedTime = a.CreatedTime != null ? a.CreatedTime.Value.ToString("dd/MM/yyyy HH:mm") : null,
                              });
                var query = query1.Concat(query2);
                var data = query.OrderByDescending(x => x.Id);
                return Json(data);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpGet]
        public string GetQuantityEmptyInRack(string rackCode)
        {
            try
            {
                var rs = _context.EDMSRacks.AsParallel().FirstOrDefault(x => x.RackCode.Equals(rackCode));
                if (rs != null)
                {
                    var prodMapping = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.RackCode.Equals(rackCode));
                    var instock = Convert.ToInt32(prodMapping.Sum(x => x.Quantity));
                    var result = rs.CNT_Box - instock;
                    return result.ToString();
                }
                else
                {
                    return "...";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //Lấy danh sách dãy bên sản phẩm
        [HttpGet]
        public object GetListLine(string storeCode)
        {
            try
            {
                var rs = (from a in _context.EDMSFloors.Where(x => x.WHS_Code == storeCode)
                          join b in _context.EDMSLines on a.FloorCode equals b.FloorCode
                          select b).ToList();

                for (int i = 0; i < rs.Count; i++)
                {
                    var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(rs[i].LineCode)).ToList();
                    if (listRack.Count > 0)
                    {
                        foreach (var rack in listRack)
                        {
                            var checkCount = GetQuantityEmptyInRack(rack.RackCode);
                            if (checkCount.Equals("..."))
                            {
                                rs.RemoveAt(i);
                                i--;
                            }
                        }
                        var temp = new List<EDMSFile>();
                    }
                    else
                    {
                        rs.RemoveAt(i);
                        i--;
                    }
                };

                return Json(rs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpGet]
        public object GetListRackByLineCode(string lineCode)
        {
            try
            {
                var listRack = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode)).ToList();

                for (int i = 0; i < listRack.Count; i++)
                {
                    var checkCount = GetQuantityEmptyInRack(listRack[i].RackCode);
                    if (checkCount.Equals("..."))
                    {
                        listRack.RemoveAt(i);
                    }
                }

                return Json(listRack);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        [HttpGet]
        public object CheckProductInStore(string productQrCode)
        {
            try
            {
                var inStore = false;
                var obj = _context.ProductInStocks.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (obj != null)
                    inStore = true;

                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpGet]
        public object CheckProductInStoreCoil(string productQrCode, string coilCode)
        {
            try
            {
                var inStore = false;
                var obj = _context.ProdPackageReceiveds.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode) && x.CoilCode.Equals(coilCode));
                if (obj != null)
                    inStore = true;

                return Json(inStore);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpGet]
        public object CheckProductCoilOrderingStore(string productQrCode)
        {
            try
            {
                var isOrdering = false;
                var obj = _context.ProdPackageReceiveds.AsParallel().Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode) && !string.IsNullOrEmpty(x.RackCode)).ToList();
                if (obj.Count > 0)
                    isOrdering = true;

                return Json(isOrdering);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        [HttpGet]
        public object CheckQuantityMaxProductInStore(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.ProductInStocks.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                if (obj != null)
                {
                    var prodList = _context.ProductEntityMappings.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode)).ToList();
                    var quantity = prodList.Sum(x => x.Quantity);
                    var quantityMax = obj.Quantity - quantity;
                    msg.Object = quantityMax;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetPositionProduct(string productQrCode, string productCoil)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = (from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.RackCode))
                                join b in _context.ProductEntityMappings.Where(x => !x.IsDeleted) on new { a.ProductQrCode, a.RackCode } equals new { b.ProductQrCode, b.RackCode }
                                where a.ProductQrCode.Equals(productQrCode) && (string.IsNullOrEmpty(productCoil) || a.CoilCode.Equals(productCoil))
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
                                    a.UpdatedTime
                                }).OrderBy(x => x.CreatedTime).ThenBy(p => p.RackCode);

                //var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                //if (prodMapping != null)
                //{
                //    var lineCode = prodMapping.LineCode;
                //    var rackCode = prodMapping.RackCode;
                //    var listRack = _context.EDMSRacks.Where(x => x.LineCode == prodMapping.LineCode).AsNoTracking().ToList();

                //    msg.Error = false;
                //    msg.Object = new { LineCode = lineCode, RackCode = rackCode, ListRack = listRack };
                //}

                msg.Error = false;
                msg.Object = listCoil;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetProductNotInStore(string productQrCode, string productCoil)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var listCoil = from a in _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && string.IsNullOrEmpty(x.RackCode))
                               where a.ProductQrCode.Equals(productQrCode) && (string.IsNullOrEmpty(productCoil) || a.CoilCode.Equals(productCoil))
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
                                   a.UpdatedTime
                               };

                //var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                //if (prodMapping != null)
                //{
                //    var lineCode = prodMapping.LineCode;
                //    var rackCode = prodMapping.RackCode;
                //    var listRack = _context.EDMSRacks.Where(x => x.LineCode == prodMapping.LineCode).AsNoTracking().ToList();

                //    msg.Error = false;
                //    msg.Object = new { LineCode = lineCode, RackCode = rackCode, ListRack = listRack };
                //}

                msg.Error = false;
                msg.Object = listCoil;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [HttpGet]
        public object SetCoilInStore(int id, string rackCode)
        {
            var msg = new JMessage() { Error = true, Title = "" };
            try
            {
                var prodInfo = _context.ProdPackageReceiveds.AsParallel().FirstOrDefault(x => x.Id.Equals(id));
                if (prodInfo != null)
                {
                    prodInfo.PositionInStore = rackCode;

                    _context.ProdPackageReceiveds.Update(prodInfo);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = "Xếp thành công";
                }
                else
                {
                    msg.Title = "Không lấy được thông tin cuộn";
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return Json(msg);
        }
        [HttpPost]
        public object OrderingProductInStore([FromBody]ProductEntityMapping data)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                if (data.ListCoil.Count > 0)
                {
                    //var prodPackageInfo = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(data.ProductQrCode)).ToList();
                    //if (prodPackageInfo.Count>0)
                    //{
                    //    foreach (var item in prodPackageInfo)
                    //    {
                    //        item.PositionInStore = null;
                    //        item.RackCode = null;
                    //        item.RackPosition = null;
                    //    }

                    //    _context.ProdPackageReceiveds.UpdateRange(prodPackageInfo);
                    //    _context.SaveChanges();
                    //}

                    var listCoilProcess = new List<ProdPackageInfoCustom>();

                    foreach (var item in data.ListCoil)
                    {
                        var check = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(item.CoilCode) && string.IsNullOrEmpty(x.RackCode));
                        if (check != null)
                            listCoilProcess.Add(item);
                    }

                    if (listCoilProcess.Count > 0)
                    {
                        foreach (var productCoil in listCoilProcess)
                        {
                            var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productCoil.ProductQrCode) && x.RackCode.Equals(productCoil.RackCode));
                            var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == productCoil.RackCode);
                            var productInRackCount = getProductInRack(productCoil.RackCode);
                            if (rack != null)
                            {
                                //if (rack.CNT_Box >= (productInRackCount + productCoil.Size))
                                //{

                                //}
                                //else
                                //{
                                //    msg.Error = true;
                                //    msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_AMOUNT_PRODUCT"));
                                //}

                                //Cho phép xếp 1 sản phẩm xếp nhiều lần ở 1 vị trị không cộng dồn thêm vào bảng log
                                if (!string.IsNullOrEmpty(productCoil.LineCode))
                                {
                                    var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                                    if (line != null)
                                    {
                                        data.LineCode = line.LineCode;

                                        var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                                        if (floor != null)
                                        {
                                            data.FloorCode = floor.FloorCode;

                                            var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                                            if (wareHouse != null)
                                                data.WHS_Code = wareHouse.WHS_Code;
                                        }
                                    }


                                    //Cập nhật lại vị trí trong bảng ProdPackageInfos
                                    var prodPackageInfoUpdate = _context.ProdPackageReceiveds.FirstOrDefault(x => !x.IsDeleted && x.CoilCode.Equals(productCoil.CoilCode) && x.ProductQrCode.Equals(productCoil.ProductQrCode));
                                    if (prodPackageInfoUpdate != null)
                                    {
                                        prodPackageInfoUpdate.PositionInStore = productCoil.PositionInStore;
                                        prodPackageInfoUpdate.RackCode = productCoil.RackCode;
                                        prodPackageInfoUpdate.RackPosition = productCoil.RackPosition;
                                        prodPackageInfoUpdate.UpdatedBy = User.Identity.Name;
                                        prodPackageInfoUpdate.UpdatedTime = DateTime.Now;
                                        _context.ProdPackageReceiveds.Update(prodPackageInfoUpdate);
                                        _context.SaveChanges();
                                    }
                                }
                                //Trường hợp chưa được xếp trong bảng mapping
                                if (prodMapping == null)
                                {
                                    if (!string.IsNullOrEmpty(productCoil.LineCode))
                                    {
                                        var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(productCoil.LineCode));
                                        if (line != null)
                                        {
                                            data.LineCode = line.LineCode;

                                            var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(line.FloorCode));
                                            if (floor != null)
                                            {
                                                data.FloorCode = floor.FloorCode;

                                                var wareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR").FirstOrDefault(x => x.WHS_Flag != true && x.WHS_Code.Equals(floor.WHS_Code));
                                                if (wareHouse != null)
                                                    data.WHS_Code = wareHouse.WHS_Code;
                                            }
                                        }

                                        //Thêm vào bảng Product_Entity_Mapping
                                        var mapping = new ProductEntityMapping
                                        {
                                            WHS_Code = data.WHS_Code,
                                            FloorCode = data.FloorCode,
                                            LineCode = productCoil.LineCode,
                                            RackCode = productCoil.RackCode,
                                            RackPosition = productCoil.RackPosition,
                                            ProductQrCode = productCoil.ProductQrCode,
                                            Quantity = productCoil.Size,
                                            Unit = data.Unit,
                                            Ordering = data.Ordering,
                                            CreatedBy = User.Identity.Name,
                                            CreatedTime = DateTime.Now,
                                        };

                                        _context.ProductEntityMappings.Add(mapping);
                                        _context.SaveChanges();

                                        //Cập nhật số lượng đã xếp kho trong bảng detail
                                        var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)mapping.Quantity;
                                        _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);
                                        _context.SaveChanges();

                                        // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                                        msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                                        //return Json(msg);
                                    }
                                }
                                else
                                {
                                    prodMapping.Quantity = prodMapping.Quantity + productCoil.Size;
                                    prodMapping.UpdatedBy = User.Identity.Name;
                                    prodMapping.UpdatedTime = DateTime.Now;
                                    _context.ProductEntityMappings.Update(prodMapping);

                                    //Cập nhật số lượng đã xếp kho trong bảng detail
                                    var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == data.ProductQrCode);
                                    materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet + (decimal)productCoil.Size;
                                    _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);

                                    _context.SaveChanges();
                                    // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_SUCCESS"));
                                    msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_SUCCESS"];
                                    //return Json(msg);
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NON_SORT_RACK_EXITS"));
                                msg.Title = _stringLocalizer["MIS_MSG_NON_SORT_RACK_EXITS"];
                            }
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Không có sản phẩm nào được xếp";
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không có sản phẩm nào để xếp";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_FAIL"));
                msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_FAIL"];
            }

            msg.Object = data;

            return Json(msg);
        }
        [HttpGet]
        private decimal getProductInRack(string RackCode)
        {
            decimal count = 0;
            var query = from a in _context.EDMSRacks.Where(x => x.RackCode == RackCode)
                        join d in _context.ProductEntityMappings.Where(x => x.IsDeleted == false) on a.RackCode equals d.RackCode
                        select new
                        {
                            a.RackCode,
                            d.Quantity
                        };
            count = query.Sum(x => x.Quantity).Value;
            return count;
        }
        [HttpGet]
        private string GetPositionInfo(string rackCode)
        {
            var positionInfo = string.Empty;
            var whsName = string.Empty;
            var floorName = string.Empty;
            var lineName = string.Empty;
            var rackName = string.Empty;
            var mapping = _context.ProductEntityMappings.FirstOrDefault(x => x.RackCode == rackCode);
            if (mapping != null)
            {
                var whs = _context.EDMSWareHouses.FirstOrDefault(x => x.WHS_Code.Equals(mapping.WHS_Code));
                if (whs != null)
                    whsName = whs.WHS_Name;

                var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode.Equals(mapping.FloorCode));
                if (floor != null)
                    floorName = floor.FloorName;

                var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode.Equals(mapping.LineCode));
                if (line != null)
                    lineName = line.L_Text;

                var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode.Equals(mapping.RackCode));
                if (rack != null)
                    rackName = rack.RackName;

                positionInfo = string.Format("{0}, {1}, {2}, {3}", rackName, lineName, floorName, whsName);
            }
            return positionInfo;
        }
        [HttpGet]
        public object CheckProductInExpTicket(string productQrCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                if (!string.IsNullOrEmpty(productQrCode))
                {
                    var query = _context.ProdDeliveryDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                    if (query != null)
                    {
                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"));
                        var query2 = _context.ProductEntityMappings.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(productQrCode));
                        if (query2 != null)
                        {
                            msg.Error = true;
                            //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_PRODUCT_NON_DELETED"));
                            msg.Title = String.Format(CommonUtil.ResourceValue("Sản phẩm đã có trong phiếu xuất kho và đã được xếp kho. Không được phép xóa !"));
                            return Json(msg);
                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NO_CODE_PRODUCT"));
                    msg.Title = _stringLocalizer["MIS_MSG_NO_CODE_PRODUCT"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_NO_CHECK_CODE_PRODUCT"));
                msg.Title = _stringLocalizer["MIS_MSG_NO_CHECK_CODE_PRODUCT"];
            }

            return Json(msg);
        }

        public object DeleteProductInStore(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };

            try
            {
                var check = _context.ProdPackageReceiveds.FirstOrDefault(x => x.Id.Equals(id));
                if (check != null)
                {
                    var prodMapping = _context.ProductEntityMappings.AsParallel().FirstOrDefault(x => x.ProductQrCode.Equals(check.ProductQrCode) && x.RackCode.Equals(check.RackCode));
                    if (prodMapping != null)
                    {
                        prodMapping.Quantity = prodMapping.Quantity > check.Size ? prodMapping.Quantity - check.Size : 0;
                        _context.ProductEntityMappings.Update(prodMapping);
                        _context.SaveChanges();

                        //Cập nhật số lượng đã xếp kho trong bảng detail
                        var materialStoreImpGoodsDetails = _context.ProdReceivedDetails.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode == prodMapping.ProductQrCode);
                        materialStoreImpGoodsDetails.QuantityIsSet = materialStoreImpGoodsDetails.QuantityIsSet > (decimal)check.Size ? materialStoreImpGoodsDetails.QuantityIsSet - (decimal)check.Size : 0;
                        _context.ProdReceivedDetails.Update(materialStoreImpGoodsDetails);
                        _context.SaveChanges();

                        //msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_DELETE_PRODUCT_SUCCESS"));
                        msg.Title = _stringLocalizer["MIS_MSG_DELETE_PRODUCT_SUCCESS"];
                        //return Json(msg);

                        //Xóa bỏ vị trí trong bảng PROD_PACKAGE_INFO
                        check.RackCode = null;
                        check.RackPosition = null;
                        check.PositionInStore = null;
                        _context.ProdPackageReceiveds.Update(check);
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_PRODUCT_SORT_WARE_HOURE"));
                        msg.Title = _stringLocalizer["MIS_MSG_PRODUCT_SORT_WARE_HOURE"];
                        //return Json(msg);
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("MIS_MSG_SORT_WARE_HOURE_FAIL"));
                msg.Title = _stringLocalizer["MIS_MSG_SORT_WARE_HOURE_FAIL"];
            }

            return Json(msg);
        }

        //Export Excel
        [HttpGet]
        public ActionResult ExportExcelProduct(string ticketCode)
        {
            var impHeader = _context.ProdReceivedHeaders.Where(x => x.TicketCode == ticketCode).Select(x => new
            {
                x.LotProductCode,
                x.TicketCode,
                x.Title,
                x.StoreCode,
                x.CusCode,
                x.Reason,
                x.StoreCodeSend,
                x.UserImport,
                x.Note,
                x.UserSend,
                Branch = _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)) != null ? _context.Users.FirstOrDefault(p => p.UserName.Equals(User.Identity.Name)).Branch.OrgName : "",
                InsurantTime = x.InsurantTime.HasValue ? x.InsurantTime.Value.ToString("dd/MM/yyyy") : "",
                TimeTicketCreate = x.TimeTicketCreate.HasValue ? x.TimeTicketCreate.Value.ToString("dd/MM/yyyy") : "",
                CreatedTime = x.TimeTicketCreate.HasValue ? "Ngày " + x.TimeTicketCreate.Value.Day + " tháng " + x.TimeTicketCreate.Value.Month + " năm " + x.TimeTicketCreate.Value.Year : "",
                StoreName = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_Name : "",
                StoreAddress = _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)) != null ? _context.EDMSWareHouses.FirstOrDefault(y => y.WHS_Code.Equals(x.StoreCode)).WHS_ADDR_Text : ""
            }).FirstOrDefault();

            var listProduct = (from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "SUB_PRODUCT")
                               join b1 in _context.SubProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductQrCode
                               join c1 in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c1.CodeSet
                               join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                               from d2 in d1.DefaultIfEmpty()
                               join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "SUB_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                               from a in a2.DefaultIfEmpty()
                               orderby b1.ProductCode
                               select new
                               {
                                   ProductCode = g.ProductCode,
                                   ProductName = b1.AttributeName,
                                   ProductType = "SUB_PRODUCT",
                                   ProductQrCode = g.ProductQrCode,
                                   sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                   Unit = b1.Unit,
                                   UnitName = c1.ValueSet,
                                   QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                   Quantity = g.Quantity,
                                   QuantityPoCount = a != null ? int.Parse(a.Quantity) : 0,//Lấy ra số lượng từ P0
                                   QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                   QuantityIsSet = g.QuantityIsSet,
                                   SalePrice = g.SalePrice,
                                   ProductLot = g.ProductLot,
                                   ProductCoil = g.ProductCoil,
                                   PackType = g.PackType,
                                   ImpType = d2.ValueSet,
                                   ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                   {
                                       k.Id,
                                       k.ProductQrCode,
                                       ProductName = b1.AttributeName,
                                       ProductCoil = k.CoilCode,
                                       ProductCoilRelative = k.CoilRelative,
                                       k.Remain,
                                       k.Size,
                                       k.TicketCode,
                                       k.PackType,
                                       k.PositionInStore,
                                       k.RackCode,
                                       k.RackPosition,
                                       k.CreatedBy,
                                       k.CreatedTime,
                                       k.UpdatedBy,
                                       k.UpdatedTime,
                                       k.UnitCoil,
                                       k.ProductImpType,
                                       k.ProductLot
                                   })
                               })
                               .Concat(from g in _context.ProdReceivedDetails.Where(y => !y.IsDeleted && y.TicketCode == ticketCode && y.ProductType == "FINISHED_PRODUCT")
                                       join b1 in _context.MaterialProducts.Where(y => !y.IsDeleted) on g.ProductCode equals b1.ProductCode
                                       join c1 in _context.CommonSettings.Where(y => !y.IsDeleted) on g.Unit equals c1.CodeSet
                                       join d in _context.CommonSettings.Where(y => !y.IsDeleted) on b1.ImpType equals d.CodeSet into d1
                                       from d2 in d1.DefaultIfEmpty()
                                       join a1 in _context.PoBuyerDetails.Where(y => !y.IsDeleted && y.ProductType == "FINISHED_PRODUCT") on new { PoSupCode = g.LotProductCode, g.ProductCode, g.ProductType } equals new { a1.PoSupCode, a1.ProductCode, a1.ProductType } into a2
                                       from a in a2.DefaultIfEmpty()
                                       orderby b1.ProductCode
                                       select new
                                       {
                                           ProductCode = g.ProductCode,
                                           ProductName = b1.ProductName,
                                           ProductType = "FINISHED_PRODUCT",
                                           ProductQrCode = g.ProductQrCode,
                                           sProductQrCode = CommonUtil.GenerateQRCode(g.ProductQrCode),
                                           Unit = b1.Unit,
                                           UnitName = c1.ValueSet,
                                           QuantityOrder = a != null ? a.QuantityNeedImport + g.Quantity : g.Quantity,
                                           Quantity = g.Quantity,
                                           QuantityPoCount = a != null ? int.Parse(a.Quantity) : 0,//Lấy ra số lượng từ P0
                                           QuantityNeedSet = g.Quantity - g.QuantityIsSet,
                                           QuantityIsSet = g.QuantityIsSet,
                                           SalePrice = g.SalePrice,
                                           ProductLot = g.ProductLot,
                                           ProductCoil = g.ProductCoil,
                                           PackType = g.PackType,
                                           ImpType = d2.ValueSet,
                                           ListCoil = _context.ProdPackageReceiveds.Where(x => !x.IsDeleted && x.ProductQrCode.Equals(g.ProductQrCode)).Select(k => new
                                           {
                                               k.Id,
                                               k.ProductQrCode,
                                               ProductName = b1.ProductName,
                                               ProductCoil = k.CoilCode,
                                               ProductCoilRelative = k.CoilRelative,
                                               k.Remain,
                                               k.Size,
                                               k.TicketCode,
                                               k.PackType,
                                               k.PositionInStore,
                                               k.RackCode,
                                               k.RackPosition,
                                               k.CreatedBy,
                                               k.CreatedTime,
                                               k.UpdatedBy,
                                               k.UpdatedTime,
                                               k.UnitCoil,
                                               k.ProductImpType,
                                               k.ProductLot
                                           })
                                       });


            var data = listProduct.ToList();

            var listExport = new List<ProdDeliveryDetailExport>();
            var no = 1;
            foreach (var item in data)
            {
                var itemExport = new ProdDeliveryDetailExport();
                itemExport.No = no;
                itemExport.ProductName = item.ProductName;
                itemExport.ProductCode = item.ProductCode;
                itemExport.Unit = item.UnitName;
                itemExport.QuantityPO = item.QuantityPoCount;
                itemExport.Quantity = item.Quantity;
                itemExport.SalePrice = item.SalePrice;
                itemExport.TotalAmount = item.SalePrice * item.Quantity;

                no = no + 1;
                listExport.Add(itemExport);
            }

            if (impHeader != null)
            {

            }

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                var pathTemplate = Path.Combine(_hostingEnvironment.WebRootPath, "files\\ImportStore_Template.xlsx");

                FileStream fileStream = new FileStream(pathTemplate, FileMode.Open, FileAccess.Read);

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
                marker.AddVariable("impHeader", impHeader);

                //Process the markers in the template
                marker.ApplyMarkers();


                int row = 14;
                int totalRow = row + listExport.Count();

                worksheet.Range["A15" + ":H" + totalRow].CellStyle = bodyStyle;
                worksheet.UsedRange.AutofitColumns();
                worksheet.UsedRange.AutofitRows();
                worksheet.ImportData(listExport, 14, 1, false);

                worksheet.Columns[2].ColumnWidth = 15;
                worksheet.Columns[7].ColumnWidth = 24;
                worksheet.Range["A2"].Text = "ĐƠN VỊ: " + impHeader.Branch;
                worksheet.Range["A3"].Text = "Bộ phận: ";
                worksheet.Range["B10"].Text = "Nhập tại kho: " + impHeader.StoreName + " Địa điểm: " + impHeader.StoreAddress;
                worksheet.Range["B" + totalRow + ":D" + totalRow].Merge(true);
                worksheet.Range["B" + totalRow].CellStyle.Font.Bold = true;
                worksheet.Range["B" + totalRow].Text = "Cộng: ";
                worksheet.Range["E" + totalRow].Text = ((int)listExport.Sum(x => x.QuantityPO)).ToString();
                worksheet.Range["F" + totalRow].Text = ((int)listExport.Sum(x => x.Quantity)).ToString();
                worksheet.Range["G" + totalRow].Text = ((int)listExport.Sum(x => x.SalePrice)).ToString();
                worksheet.Range["H" + totalRow].Text = ((int)listExport.Sum(x => x.TotalAmount)).ToString();

                worksheet.Range["A" + (totalRow + 1)].Text = "Tổng số tiền(viết bằng chữ): " + ConvertWholeNumber(((int)listExport.Sum(x => x.TotalAmount)).ToString());
                worksheet.Range["A" + (totalRow + 2)].Text = "Số chứng từ gốc kèm theo: " + impHeader.LotProductCode;
                //Saving the workbook as stream
                workbook.Version = ExcelVersion.Excel2010;

                string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var fileName = "ExportFile_Phieu_Nhap_Kho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx";
                MemoryStream ms = new MemoryStream();
                workbook.SaveAs(ms);
                workbook.Close();
                excelEngine.Dispose();
                ms.Position = 0;
                return File(ms, ContentType, fileName);
            }
        }
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
        public class MaterialStoreImpModel
        {
            public int Id { get; set; }
            public string TicketCode { get; set; }
            public string QrTicketCode { get; set; }
            public string LotProductCode { get; set; }
            public string CusCode { get; set; }
            public string CusName { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string Title { get; set; }
            public string UserImport { get; set; }
            public string UserImportName { get; set; }
            public string UserSend { get; set; }
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
            public string StoreCodeSend { get; set; }
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
        public class MaterialStoreImpModelInsert
        {
            public MaterialStoreImpModelInsert()
            {
                ListProduct = new List<MaterialStoreImpModelDetailInsert>();
            }
            public string LotProductCode { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string StoreCode { get; set; }
            public string CusCode { get; set; }
            public string Reason { get; set; }
            public string StoreCodeSend { get; set; }
            public decimal CostTotal { get; set; }
            public string Currency { get; set; }
            public decimal Discount { get; set; }
            public decimal TaxTotal { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalMustPayment { get; set; }
            public decimal TotalPayed { get; set; }
            public string PaymentStatus { get; set; }
            public string NextTimePayment { get; set; }
            public string UserImport { get; set; }
            public string Note { get; set; }
            public string UserSend { get; set; }
            public string InsurantTime { get; set; }
            public string TimeTicketCreate { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListProduct { get; set; }
        }
        public class MaterialStoreImpModelDetailInsert
        {
            public MaterialStoreImpModelDetailInsert()
            {
                ListCoil = new List<MaterialStoreImpModelDetailInsert>();
            }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string ProductType { get; set; }
            public string ProductQrCode { get; set; }
            public string sProductQrCode { get; set; }
            public string RackCode { get; set; }
            public string RackName { get; set; }
            public decimal Quantity { get; set; }
            public decimal QuantityIsSet { get; set; }
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
            public string ProductCoil { get; set; }
            public string sProductCoil { get; set; }
            public string ProductLot { get; set; }
            public string ProductCoilRelative { get; set; }
            public string PackType { get; set; }
            public string QuantityCoil { get; set; }
            public string ValueCoil { get; set; }
            public string UnitCoil { get; set; }
            public string ProductImpType { get; set; }
            public string RuleCoil { get; set; }
            public string RackPosition { get; set; }
            public string PositionInStore { get; set; }
            public List<MaterialStoreImpModelDetailInsert> ListCoil { get; set; }
        }
        #endregion
        #region 
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}