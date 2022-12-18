using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProductQRCodeManagerController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<ProductQRCodeManagerController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public ProductQRCodeManagerController(EIMDBContext context, IStringLocalizer<ProductQRCodeManagerController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductQrCodes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                            && (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                            && (string.IsNullOrEmpty(jTablePara.ImpCode) || a.ImpCode.Equals(jTablePara.ImpCode))
                            && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                        orderby a.Id descending
                        select new ProductQrCodeRes
                        {
                            Id = a.Id,
                            Code = a.QrCode,
                            QrCode = a.QrCode,
                            Count = a.Count,
                            CreatedBy = (b != null ? b.GivenName : ""),
                            CreatedTime = a.CreatedTime,
                            ProductName = (c != null ? c.ProductName : "")
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "QrCode", "QR_Code", "Count", "CreatedBy", "CreatedTime", "ProductName");
            return Json(jdata);
        }

        [HttpPost]
        public object GetListQrCodeBySearch([FromBody]JTableProductQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.ProductQrCodes
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c2
                        from c in c2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.Product) || (!string.IsNullOrEmpty(jTablePara.Product) && c != null && (c.ProductCode.ToLower().Contains(jTablePara.Product.ToLower()) || c.ProductName.ToLower().Contains(jTablePara.Product.ToLower()))))
                            && (string.IsNullOrEmpty(jTablePara.LotCode) || a.LotCode.Equals(jTablePara.LotCode))
                            && (string.IsNullOrEmpty(jTablePara.ImpCode) || a.ImpCode.Equals(jTablePara.ImpCode))
                            && ((fromDate == null) || (a.CreatedTime != null && a.CreatedTime.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime != null && a.CreatedTime.Date <= toDate))
                        orderby a.Id descending
                        select new ProductQrCodeRes
                        {
                            Id = a.Id,
                            Code = a.QrCode,
                            QrCode = a.QrCode,
                            Count = a.Count,
                            CreatedBy = (b != null ? b.GivenName : ""),
                            CreatedTime = a.CreatedTime,
                            ProductName = (c != null ? c.ProductName : "")
                        };

            var count = query.Count();
            var data = query.AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QrCode = CommonUtil.GenerateQRCode(item.QrCode);
            }
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetLotProduct()
        {
            var data = from a in _context.LotProducts
                       where a.IsDeleted == false
                       select new
                       {
                           Code = a.LotProductCode,
                           Name = a.LotProductName
                       };
            return Json(data.ToList());
        }
        [HttpPost]
        public JsonResult GetImp()
        {
            var data = from a in _context.ProdReceivedHeaders
                       where a.IsDeleted == false
                       orderby a.Id descending
                       select new
                       {
                           Code = a.TicketCode,
                           Name = a.Title
                       };
            return Json(data.ToList());
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
    public class JTableProductQRCodeModel : JTableModel
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Product { get; set; }
        public string LotCode { get; set; }
        public string ImpCode { get; set; }
    }
    public class ProductQrCodeRes
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string QrCode { get; set; }
        public int Count { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string ProductName { get; set; }
    }
}