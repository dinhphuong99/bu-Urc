using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;


namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialExportInfoProductController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;


        private readonly IStringLocalizer<MaterialExportInfoProductController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MaterialExportInfoProductController(EIMDBContext context, IStringLocalizer<MaterialExportInfoProductController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        //{
        //    _context = context;
        //    _appSettings = appSettings.Value;
        //}
        public IActionResult Index()
        {
            return View("Index");
        }
        [HttpGet]
        public JsonResult GetListProductInStore()
        {
            var data = from a in _context.ProductEntityMappings
                       join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b1
                       from b in b1.DefaultIfEmpty()
                       where a.IsDeleted == false
                       select new
                       {
                           a.Id,
                           a.ProductQrCode,
                           a.Quantity,
                           a.Unit,
                           b.RackName
                       };
            return Json(data);
        }
        [HttpGet]
        public JsonResult GetInfoProductInStore(int id)
        {
            var data = from a in _context.ProductEntityMappings
                       join b in _context.ProductInStocks on a.ProductQrCode equals b.ProductQrCode
                       join c in _context.ProdReceivedDetails on a.ProductQrCode equals c.ProductQrCode into c1
                       from c in c1.DefaultIfEmpty()
                       join d in _context.ProdDeliveryDetails on a.ProductQrCode equals d.ProductQrCode into d1
                       from d in d1.DefaultIfEmpty()
                       join e in _context.MaterialProducts on b.ProductCode equals e.ProductCode into e1
                       from e in e1.DefaultIfEmpty()
                       join f in _context.EDMSWareHouses on a.WHS_Code equals f.WHS_Code into f1
                       from f in f1.DefaultIfEmpty()
                       join g in _context.EDMSFloors on a.FloorCode equals g.FloorCode into g1
                       from g in g1.DefaultIfEmpty()
                       join h in _context.EDMSLines on a.LineCode equals h.LineCode into h1
                       from h in h1.DefaultIfEmpty()
                       join i in _context.EDMSRacks on a.RackCode equals i.RackCode into i1
                       from i in i1.DefaultIfEmpty()
                       where a.IsDeleted == false && a.Id.Equals(id)
                       select new
                       {
                           a.Id,
                           a.ProductQrCode,
                           a.Quantity,
                           e.Unit,
                           QrCode = CommonUtil.GenerateQRCode(a.ProductQrCode),
                           BarCode = CommonUtil.GenerateBarCode(a.ProductQrCode),
                           ProductType = !string.IsNullOrEmpty(b.LotProductCode) ? "Sản phẩm theo lô" : "Sản phẩm lẻ",
                           LotProductCode = !string.IsNullOrEmpty(b.LotProductCode) ? b.LotProductCode : "Sản phẩm không theo lô",
                           b.StoreCode,
                           TicketImpCode = c.TicketCode,
                           TicketExpCode = d.TicketCode != null ? d.TicketCode : "Sản phẩm chưa được xuất kho",
                           e.ProductName,
                           f.WHS_Name,
                           g.FloorName,
                           LineName = h.L_Text,
                           i.RackName
                       };
            return Json(data);
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

    public class ProductInfo
    {

    }

}
