using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM;
using ESEIM.Controllers;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Syncfusion.XlsIO;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ReportStaticsStockCardController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        public static List<Progress> progress;

        public class JTableModelCustom : JTableModel
        {
            public string ProductCode { get; set; }
            public string ProductType { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
            public string Category { get; set; }
            public string Group { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string ContractCode { get; set; }
            public string CusCode { get; set; }
            public string SupCode { get; set; }
            public string StoreCode { get; set; }
        }

        private readonly IStringLocalizer<ReportStaticsStockCardController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ReportStaticsStockCardController(EIMDBContext context, IStringLocalizer<ReportStaticsStockCardController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        //{
        //    _context = context;
        //    _hostingEnvironment = hostingEnvironment;
        //    _appSettings = appSettings.Value;
        //}

        public IActionResult Index()
        {
            return View("Index");
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var queryRs = from a in _context.VImpExpProducts
                              where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                                 && (string.IsNullOrEmpty(jTablePara.ContractCode) || a.PoCode.Equals(jTablePara.ContractCode) || a.HeaderCode.Equals(jTablePara.ContractCode))
                                 && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                                 && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                                 && (string.IsNullOrEmpty(jTablePara.StoreCode) || a.StoreCode.Equals(jTablePara.StoreCode))
                                 && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                                 && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                                 && (string.IsNullOrEmpty(jTablePara.ProductType) || a.ProductType.Equals(jTablePara.ProductType))
                                 && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                 && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                              select new
                              {
                                  a.ProductCode,
                                  a.ProductName,
                                  a.ProductType,
                                  a.Cost,
                                  a.Quantity,
                                  //a.QuantityNeedImpExp,
                                  //a.CusCode,
                                  //a.CusName,
                                  //a.SupCode,
                                  //a.SupName,
                                  a.CreatedTime,
                                  //a.Category,
                                  //a.CategoryName,
                                  a.Type,
                                  a.Unit,
                                  a.UnitName,
                                  a.HeaderCode,
                                  a.HeaderName,
                                  //a.PoCode,
                                  //a.PoName,
                                  a.StoreCode,
                                  a.StoreName,
                                  a.QuantityInStore,
                                  a.TotalQuantityByStore,
                                  a.TotalQuantityInStore,
                                  //CreatedTimeSale = a.Type.Equals("SALE_EXP") ? a.CreatedTime : (DateTime?)null,
                                  //CreatedTimeBuy = a.Type.Equals("BUY_IMP") ? a.CreatedTime : (DateTime?)null
                              };

                var count = queryRs.Count();
                var data = queryRs.OrderUsingSortExpression(jTablePara.QueryOrderBy).ThenBy("Type").ThenByDescending("CreatedTime").Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ProductCode", "ProductName", "ProductType", "Cost", "Quantity", "QuantityNeedImpExp", "CusCode", "CusName", "SupCode", "SupName", "Unit", "UnitName", "Category", "CategoryName", "Type", "CreatedTimeSale", "CreatedTimeBuy", "CreatedTime", "HeaderCode", "HeaderName", "PoCode", "PoName", "StoreCode", "StoreName", "QuantityInStore", "TotalQuantityByStore", "TotalQuantityInStore");

                return Json(jdata);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableModelCustom jTablePara)
        {
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromTo) ? DateTime.ParseExact(jTablePara.FromTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.DateTo) ? DateTime.ParseExact(jTablePara.DateTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            try
            {
                var query = (from a in _context.VImpExpProducts
                             where (string.IsNullOrEmpty(jTablePara.Category) || a.Category.Equals(jTablePara.Category))
                                && (string.IsNullOrEmpty(jTablePara.ContractCode) || a.PoCode.Equals(jTablePara.ContractCode) || a.HeaderCode.Equals(jTablePara.ContractCode))
                                && (string.IsNullOrEmpty(jTablePara.CusCode) || a.CusCode.Equals(jTablePara.CusCode))
                                && (string.IsNullOrEmpty(jTablePara.SupCode) || a.SupCode.Equals(jTablePara.SupCode))
                                && (string.IsNullOrEmpty(jTablePara.StoreCode) || a.StoreCode.Equals(jTablePara.StoreCode))
                                && (string.IsNullOrEmpty(jTablePara.Type) || a.Type.Contains(jTablePara.Type))
                                && (string.IsNullOrEmpty(jTablePara.ProductCode) || a.ProductCode.Equals(jTablePara.ProductCode))
                                && (string.IsNullOrEmpty(jTablePara.ProductType) || a.ProductType.Equals(jTablePara.ProductType))
                                && ((fromDate == null) || (a.CreatedTime.Value.Date >= fromDate.Value.Date))
                                && ((toDate == null) || (a.CreatedTime.Value.Date <= toDate.Value.Date))
                             select new
                             {
                                 a.ProductCode,
                                 a.ProductName,
                                 a.ProductType,
                                 a.StoreCode,
                                 a.Type,
                                 a.Cost,
                                 a.Quantity,
                                 a.QuantityInStore,
                                 a.TotalQuantityByStore,
                                 a.TotalQuantityInStore
                             }).ToList();
                var queryRs = new
                {
                    TotalCost = query.Sum(x => x.Cost),
                    TotalAmount = query.Sum(x => x.Cost * x.Quantity),
                    TotalQuantity = query.Where(k => k.Type == "BUY_IMP").Sum(i => i.Quantity) - query.Where(k => k.Type == "SALE_EXP").Sum(i => i.Quantity),
                    //TotalQuantityInStore = query.GroupBy(k => k.ProductCode).Select(m => new { m.First().TotalQuantityInStore, m.First().ProductCode }).Sum(h => h.TotalQuantityInStore)
                    TotalQuantityByStore = query.GroupBy(k => new { k.ProductCode, k.StoreCode }).Select(m => new { m.First().TotalQuantityByStore, m.First().ProductCode }).Sum(h => h.TotalQuantityByStore),
                    TotalQuantityInStore = query.GroupBy(k => new { k.ProductCode }).Select(m => new { m.First().TotalQuantityInStore, m.First().ProductCode }).Sum(h => h.TotalQuantityInStore),
                };

                return Json(queryRs);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        [HttpPost]
        public object GetListProduct()
        {
            var rs = from b in _context.SubProducts.Where(x => !x.IsDeleted)
                     join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                     from c2 in c1.DefaultIfEmpty()
                     orderby b.ProductCode
                     select new
                     {
                         Code = b.ProductQrCode,
                         Name = b.AttributeName,
                         Unit = b.Unit,
                         ProductCode = b.ProductCode,
                         UnitName = c2.ValueSet,
                         b.AttributeCode,
                         b.AttributeName,
                         ProductType = "SUB_PRODUCT",
                     };

            var rs1 = from b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT")
                      join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on b.Unit equals c.CodeSet into c1
                      from c2 in c1.DefaultIfEmpty()
                      orderby b.ProductCode
                      select new
                      {
                          Code = b.ProductCode,
                          Name = string.Format("Thành phẩm: {0}", b.ProductName),
                          Unit = b.Unit,
                          ProductCode = b.ProductCode,
                          UnitName = c2.ValueSet,
                          AttributeCode = "",
                          AttributeName = "",
                          ProductType = "FINISHED_PRODUCT",
                      };

            return rs1.Concat(rs);
        }

        [HttpPost]
        public object GetListContract()
        {
            //var listSale = _context.PoSaleHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ContractCode)).Select(x => new
            //{
            //    Code = x.ContractCode,
            //    Name = x.Title
            //}).ToList();

            var listSaleRetail = _context.ProdDeliveryHeaders.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            //var listBuyPo= _context.PoBuyerHeaders.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.PoSupCode)).Select(x => new
            //{
            //    Code = x.PoSupCode,
            //    Name = x.PoSupCode//Bỏ trường tiêu đề nên lấy trường code để hiển thị
            //}).ToList();

            var listBuyRetail = _context.ProdReceivedHeaders.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.TicketCode,
                Name = x.Title
            }).ToList();

            var query = listBuyRetail.Concat(listSaleRetail);

            return query;
        }

        [HttpPost]
        public object GetListCustommer()
        {
            var query = _context.Customerss.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.CusCode,
                Name = x.CusName
            }).ToList();

            return query;
        }

        [HttpPost]
        public object GetListSupplier()
        {
            var query = _context.Suppliers.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.SupCode,
                Name = x.SupName
            }).ToList();

            return query;
        }

        [HttpPost]
        public object GetListStore()
        {
            var query = _context.EDMSWareHouses.Where(x => !x.WHS_Flag && x.Type == "PR").Select(x => new
            {
                Code = x.WHS_Code,
                Name = x.WHS_Name
            }).ToList();

            return query;
        }

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