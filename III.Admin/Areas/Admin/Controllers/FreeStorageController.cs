using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FreeStorageController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<FreeStorageController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public class JTableModelCustom : JTableModel
        {
            public string QrCode { get; set; }
            public string BarCode { get; set; }
            public string Title { get; set; }
            public string Supplier { get; set; }
            public string CreatedDate { get; set; }
            public string ExpiryDate { get; set; }
            public string Name { get; set; }
            public string ProductName { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }


        public class JTableProductCustom : JTableModel
        {
            public string LotProductCode { get; set; }
        }

        public FreeStorageController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<FreeStorageController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {

            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]JtableMappingSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ProductEntityMappings.Where(x => x.IsDeleted == false)
                        join b in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.WHS_Code equals b.WHS_Code into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                        from e in e2.DefaultIfEmpty()
                            //join f in _context.Users on a.CreatedBy equals f.UserName into f2
                            //from f in f2.DefaultIfEmpty()

                        select new FreeStorageRes
                        {
                            Id = a.Id,
                            ProductQrCode = a.ProductQrCode,
                            WHS_Name = (b != null ? b.WHS_Name : ""),
                            FloorName = (c != null ? c.FloorName : ""),
                            L_Text = (d != null ? d.L_Text : ""),
                            RackName = (e != null ? e.RackName : ""),
                            RackPosition = a.RackPosition,
                            Position = (c != null ? c.FloorName : "") + "_" + (d != null ? d.L_Text : "") + "_" + (e != null ? e.RackName : ""),
                            //CreatedBy = (f!=null?f.GivenName:""),
                            //CreatedTime = a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            foreach (var item in data1)
            {
                item.PositionOld = getOldPos(item.Id);
            }
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "ProductQrCode", "WHS_Name", "FloorName", "L_Text", "RackName", "RackPosition", "Position", "PositionOld", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        public string getOldPos(int Id)
        {
            string s = "";
            var dt = _context.EDMSMoveProductLogs.OrderByDescending(x => x.Id).FirstOrDefault(x => x.MappingId == Id);
            if (dt != null)
            {
                var data = from a in _context.EDMSMoveProductLogs
                           join b in _context.EDMSFloors on a.FloorCodeOld equals b.FloorCode into b2
                           from b in b2.DefaultIfEmpty()
                           join c in _context.EDMSLines on a.LineCodeOld equals c.LineCode into c2
                           from c in c2.DefaultIfEmpty()
                           join d in _context.EDMSRacks on a.RackCodeOld equals d.RackCode into d2
                           from d in d2.DefaultIfEmpty()
                           where a.MappingId == Id
                           orderby a.Id descending
                           select new
                           {
                               Position = (b != null ? b.FloorName : "") + "_" + (c != null ? c.L_Text : "") + "_" + (d != null ? d.RackName : "")
                           };
                var list = data.ToList();
                if (list.Count > 0)
                {
                    s = list[0].Position;
                }
            }
            return s;
        }
        public JsonResult GetProduct()
        {
            var data = from a in _context.ProductEntityMappings
                       join b in _context.EDMSRacks on a.RackCode equals b.RackCode into b2
                       from b in b2.DefaultIfEmpty()
                       where a.IsDeleted == false

                       select new
                       {
                           a.Id,
                           ProductQrCode = a.ProductQrCode + " _ " + (b != null ? b.RackName : ""),
                       };
            return Json(data);
        }
        public JsonResult GetFloorInStoreByProductId(int Id)
        {
            var data = _context.ProductEntityMappings.FirstOrDefault(x => x.Id == Id);
            if (data != null && !string.IsNullOrEmpty(data.WHS_Code))
            {
                var listFloor = _context.EDMSFloors.Where(x => x.WHS_Code == data.WHS_Code).ToList();
                return Json(listFloor);
            }
            return Json(data);
        }

        public JsonResult GetLineByFloor(string floorCode)
        {
            var listFloor = _context.EDMSLines.Where(x => x.FloorCode == floorCode).ToList();
            return Json(listFloor);
        }

        public JsonResult GetRackByLine(string lineCode)
        {
            var listFloor = _context.EDMSRacks.Where(x => x.LineCode == lineCode).ToList();
            return Json(listFloor);
        }

        public JsonResult GetItem(int Id)
        {
            var query = from a in _context.ProductEntityMappings.Where(x => x.IsDeleted == false && x.Id == Id)
                        join b in _context.EDMSWareHouses.Where(x => x.Type == "PR") on a.WHS_Code equals b.WHS_Code into b2
                        from b in b2.DefaultIfEmpty()
                        join c in _context.EDMSFloors on a.FloorCode equals c.FloorCode into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.EDMSLines on a.LineCode equals d.LineCode into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.EDMSRacks on a.RackCode equals e.RackCode into e2
                        from e in e2.DefaultIfEmpty()

                        select new
                        {
                            a.Id,
                            a.ProductQrCode,
                            WHS_Name = (b != null ? b.WHS_Name : ""),
                            FloorName = (c != null ? c.FloorName : ""),
                            L_Text = (d != null ? d.L_Text : ""),
                            RackName = (e != null ? e.RackName : ""),
                            a.RackPosition,
                            a.Quantity
                        };
            return Json(query.FirstOrDefault());
        }

        [HttpPost]
        public JsonResult Update([FromBody] MoveProduct obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.ProductEntityMappings.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (data.FloorCode == obj.Floor && data.LineCode == obj.Line && data.RackCode == obj.Rack)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_ERR_UPDATE1"];//"Sản phẩm chọn đã được xếp vào vị trí của kệ này";
                    }
                    else if (obj.QuantityEmpty < obj.Quantity)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_UPDATE_QUANTITY_EMPTY"];//"Kệ không đủ chỗ trống";
                    }
                    else
                    {
                        //var data1 = _context.ProductEntityMappings.FirstOrDefault(x => x.FloorCode == obj.Floor && x.LineCode == obj.Line && x.RackCode == obj.Rack && x.IsDeleted == false);
                        //if (data1 != null && data1.Id != data.Id)
                        //{
                        //    msg.Error = true;
                        //    msg.Title = "Đã có sản phẩm khác xếp ở vị trí này";
                        //}
                        //else
                        //{
                        EDMSMoveProductLog productLog = new EDMSMoveProductLog();
                        productLog.ProductCode = data.ProductQrCode;
                        productLog.RackCodeOld = data.RackCode;
                        productLog.RackCodeNew = obj.Rack;
                        productLog.LineCodeOld = data.LineCode;
                        productLog.FloorCodeOld = data.FloorCode;
                        productLog.MappingId = data.Id;
                        productLog.CreatedBy = ESEIM.AppContext.UserName;
                        productLog.CreatedTime = DateTime.Now;
                        _context.EDMSMoveProductLogs.Add(productLog);

                        data.FloorCode = obj.Floor;
                        data.LineCode = obj.Line;
                        data.RackCode = obj.Rack;

                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;
                        _context.ProductEntityMappings.Update(data);

                        var listExp = _context.ProdReceivedDetails.Where(x => x.ProductQrCode == data.ProductQrCode && x.IsDeleted == false).ToList();
                        foreach (var item in listExp)
                        {
                            item.RackCode = data.RackCode;
                        }
                        _context.ProdReceivedDetails.UpdateRange(listExp);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _stringLocalizer["FREE_STORAGE_MSG_UPDATE_SUCCESS"];//"Xếp lại vị trí sản phẩm thành công";
                        //}
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["FREE_STORAGE_MSG_ERR_UPDATE2"];//"Bản ghi không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
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
        public class MoveProduct
        {
            public int Id { get; set; }
            public string Floor { get; set; }
            public string Line { get; set; }
            public string Rack { get; set; }
            public int QuantityEmpty { get; set; }
            public int Quantity { get; set; }
        }

        public class JtableMappingSearch : JTableModel
        {
            public string Product { get; set; }
            public string LotCode { get; set; }
            public string TicketCode { get; set; }
        }

        public class FreeStorageRes
        {
            public int Id { get; set; }
            public string ProductQrCode { get; set; }
            public string WHS_Name { get; set; }
            public string FloorName { get; set; }
            public string L_Text { get; set; }
            public string RackName { get; set; }
            public string RackPosition { get; set; }
            public string Position { get; set; }
            public string PositionOld { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedTime { get; set; }
        }
    }
}