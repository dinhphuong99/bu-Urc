using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class InventoryController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<InventoryController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelInventory : JTableModel
        {
            public string ProductCode { get; set; }
            public string StoreCode { get; set; }
            public string LotProductCode { get; set; }
            public string ProductQrCode { get; set; }
        }
        public InventoryController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog, IStringLocalizer<InventoryController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
        public JsonResult JTable([FromBody]JTableModelInventory jTablePara)
        {
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;

                var query = FuncJTable(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode);

                var count = query.Count();
                //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
                //foreach (var item in data)
                //{
                //    item.sQrCode = CommonUtil.GenerateQRCode(item.QrCode);
                //    //item.sBarCode = CommonUtil.GenerateBarCode(item.Barcode);
                //}

                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ProductCode", "TicketTitle", "TimeTicketCreate", "ProductName", "StoreCode", "StoreName", "LotProductCode", "LotProductName", "QrCode", "sQrCode", "CreatedTime", "Unit", "ProductGroup", "ProductType", "Quantity", "Image", "PathImg");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                var jdata = JTableHelper.JObjectTable(new List<InventoryRes>(), jTablePara.Draw, 0, "Id", "ProductCode", "TicketTitle", "TimeTicketCreate", "ProductName", "StoreCode", "StoreName", "LotProductCode", "LotProductName", "QrCode", "sQrCode", "CreatedTime", "Unit", "ProductGroup", "ProductType", "Quantity", "Image", "PathImg");
                return Json(jdata);
            }
        }
        [NonAction]
        public IQueryable<InventoryRes> FuncJTable(string ProductCode, string StoreCode, string LotProductCode, string ProductQrCode)
        {
            var query = from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT") on a.ProductCode equals b.ProductCode
                        join f in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals f.WHS_Code
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a.Unit equals c.CodeSet
                        join j in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals j.ProductQrCode
                        join k in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode

                        join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                        from m2 in m1.DefaultIfEmpty()
                        join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                        from d1 in d2.DefaultIfEmpty()
                        join e in _context.MaterialTypes.Where(x => !x.IsDeleted) on b.TypeCode equals e.Code into e2
                        from e1 in e2.DefaultIfEmpty()
                        where
                        (string.IsNullOrEmpty(ProductQrCode) || (!string.IsNullOrEmpty(a.ProductQrCode) && a.ProductQrCode.ToLower().Contains(ProductQrCode.ToLower())))
                         && (string.IsNullOrEmpty(ProductCode) || (a.ProductCode.ToLower().Contains(ProductCode.ToLower())))
                         && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode.ToLower().Contains(StoreCode.ToLower())))
                         && (string.IsNullOrEmpty(LotProductCode) || (a.LotProductCode.ToLower().Contains(LotProductCode.ToLower())))
                        select new InventoryRes
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            ProductName = b.ProductName,
                            StoreCode = a.StoreCode,
                            StoreName = f.WHS_Name,
                            LotProductCode = a.LotProductCode,
                            LotProductName = m2.PoTitle,

                            TicketTitle = k.Title,
                            TimeTicketCreate = k.TimeTicketCreate,
                            QrCode = a.ProductQrCode,
                            CreatedTime = a.CreatedTime,
                            Unit = c.ValueSet,
                            ProductGroup = (d1 != null ? d1.Name : ""),
                            ProductType = (e1 != null ? e1.Name : ""),
                            Quantity = a.Quantity,
                            Image = b.Image,
                            PathImg = b.Image
                        };
            var query1 = from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                         join b in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductQrCode
                         join f in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals f.WHS_Code
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a.Unit equals c.CodeSet
                         join h in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "SUB_PRODUCT") on b.ProductCode equals h.ProductCode
                         join j in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals j.ProductQrCode
                         join k in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode
                         join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                         from m2 in m1.DefaultIfEmpty()
                         join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on h.GroupCode equals d.Code into d2
                         from d1 in d2.DefaultIfEmpty()
                         join e in _context.MaterialTypes.Where(x => !x.IsDeleted) on h.TypeCode equals e.Code into e2
                         from e1 in e2.DefaultIfEmpty()
                         where
                         (string.IsNullOrEmpty(ProductQrCode) || (!string.IsNullOrEmpty(a.ProductQrCode) && a.ProductQrCode.ToLower().Contains(ProductQrCode.ToLower())))
                         /// thay a.ProductCode == ProductCode = h.ProductCode == ProductCode để fix bug
                          && (string.IsNullOrEmpty(ProductCode) || (h.ProductCode.Contains(ProductCode)))
                          && (string.IsNullOrEmpty(StoreCode) || (a.StoreCode == StoreCode))
                          && (string.IsNullOrEmpty(LotProductCode) || (a.LotProductCode == LotProductCode))

                         select new InventoryRes
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductName = b.AttributeName,
                             StoreCode = a.StoreCode,
                             StoreName = f.WHS_Name,
                             LotProductCode = a.LotProductCode,
                             LotProductName = m2.PoTitle,
                             TicketTitle = k.Title,
                             TimeTicketCreate = k.TimeTicketCreate,
                             QrCode = a.ProductQrCode,
                             CreatedTime = a.CreatedTime,
                             Unit = c.ValueSet,
                             ProductGroup = (d1 != null ? d1.Name : ""),
                             ProductType = (e1 != null ? e1.Name : ""),
                             Quantity = a.Quantity,
                             Image = b.Image,
                             PathImg = b.Image,
                         };

            var rs = query.Union(query1).OrderByDescending(x => x.CreatedTime);
            var groupCost = rs.GroupBy(x => new { x.ProductCode, x.ProductType }).Select(y => new InventoryRes
            {
                ProductCode = y.Key.ProductCode,
                ProductType = y.Key.ProductType,
                Total = y.Sum(c => c.Quantity)
            });
            var rs1 = from a in rs
                      join b in groupCost on new { a.ProductCode, a.ProductType } equals new { b.ProductCode, b.ProductType } into b2
                      from b in b2.DefaultIfEmpty()
                      select new InventoryRes
                      {
                          Id = a.Id,
                          ProductCode = a.ProductCode,
                          ProductName = a.ProductName,
                          StoreCode = a.StoreCode,
                          StoreName = a.StoreName,
                          LotProductCode = a.LotProductCode,
                          LotProductName = a.LotProductName,
                          TicketTitle = a.TicketTitle,
                          TimeTicketCreate = a.TimeTicketCreate,
                          QrCode = a.QrCode,
                          CreatedTime = a.CreatedTime,
                          Unit = a.Unit,
                          ProductGroup = a.ProductGroup,
                          ProductType = a.ProductType,
                          Quantity = a.Quantity,
                          Image = b.Image,
                          PathImg = b.Image,
                          Total = (b != null ? b.Total : 0)
                      };
            return rs1;
        }

        [HttpPost]
        public object GetTotal([FromBody]JTableModelInventory jTablePara)
        {
            var query = FuncJTable(jTablePara.ProductCode, jTablePara.StoreCode, jTablePara.LotProductCode, jTablePara.ProductQrCode);

            var sumQuantity = query.Sum(x => x.Quantity);

            var rs = new { sumQuantity };
            return Json(rs);
        }

        [HttpPost]
        public object GetStores()
        {
            var data = from a in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR")
                       select new
                       {
                           Code = a.WHS_Code,
                           Name = a.WHS_Name
                       };
            return data.ToList();
        }
        [HttpPost]
        public object GetListProductCode()
        {
            var data = from a in _context.MaterialProducts.Where(x => !x.IsDeleted)
                       select new
                       {
                           Code = a.ProductCode,
                           Name = a.ProductName,
                           ProductType = "FINISHED_PRODUCT",
                           CreatedTime = a.CreatedTime
                       };
            //var sub = from a in _context.SubProducts.Where(x => x.IsDeleted == false)
            //          select new
            //          {
            //              Code = a.AttributeCode,
            //              Name = a.AttributeName,
            //              ProductType = "SUB_PRODUCT",
            //              CreatedTime = a.CreatedTime
            //          };
            //var query = data.Union(sub).OrderByDescending(x=>x.CreatedTime).ToList();
            return data.ToList();
        }
        [HttpPost]
        public object GetListLotProductCode()
        {
            var data = from a in _context.PoBuyerHeaders.Where(x => !x.IsDeleted)
                       orderby a.Id descending
                       select new
                       {
                           Code = a.PoSupCode,
                           Name = a.PoTitle
                       };
            return data.ToList();
        }


        [HttpGet]
        public ActionResult ExportExcel(string ProductCode, string StoreCode, string LotProductCode, string ProductQrCode)
        {
            //int pageInt = int.Parse(page);
            //int length = int.Parse(row);
            //Get data View
            var listData = FuncJTable(ProductCode, StoreCode, LotProductCode, ProductQrCode).AsNoTracking().ToList();
            var listExport = new List<InventoryExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new InventoryExportModel();
                itemExport.No = no;
                itemExport.QrCode = item.QrCode;
                itemExport.LotProductName = item.LotProductName;
                itemExport.ProductName = item.ProductName;
                //itemExport.Quantity = item.FromDate != null ? item.FromDate.ToString("dd/MM/yyyy") : "";
                //itemExport.ToDate = item.ToDate != null ? item.ToDate.ToString("dd/MM/yyyy") : "";
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.StoreName = item.StoreName;
                itemExport.ProductGroup = item.ProductGroup;
                itemExport.ProductType = item.ProductType;
                itemExport.TicketTitle = item.TicketTitle;
                itemExport.TimeTicketCreate = item.TimeTicketCreate.HasValue ? item.TimeTicketCreate.Value.Date.ToString("dd/MM/yyyy") : "";
                //itemExport.Percent = item.Percent.ToString();

                //if (item.Percent == 100)
                //{
                //    itemExport.Percent = "100%";
                //}
                //else if (item.Percent == 0)
                //{
                //    itemExport.Percent = "0%";
                //}
                //else
                //{
                //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
                //}
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TonKho");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:K1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TỒN KHO";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "MÃ QR SẢN PHẨM";
            sheetRequest["C2"].Text = "ĐƠN HÀNG SẢN PHẨM";
            sheetRequest["D2"].Text = "TÊN SẢN PHẨM";
            sheetRequest["E2"].Text = "LUỢNG TỒN";
            sheetRequest["F2"].Text = "ÐƠN VỊ";
            sheetRequest["G2"].Text = "KHO";
            sheetRequest["H2"].Text = "NHÓM SẢN PHẨM";
            sheetRequest["I2"].Text = "LOẠI SẢN PHẨM";
            sheetRequest["J2"].Text = "TÊN PHIẾU NHẬP";
            sheetRequest["K2"].Text = "NGÀY NHẬP";


            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:K2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:K2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonKho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }


        [HttpGet]
        public ActionResult Export(string listId)
        {
            var ids = listId.Split(",");
            var query = from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "FINISHED_PRODUCT")
                        join b in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "FINISHED_PRODUCT") on a.ProductCode equals b.ProductCode
                        join f in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals f.WHS_Code
                        join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a.Unit equals c.CodeSet
                        join j in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals j.ProductQrCode
                        join k in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode

                        join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                        from m2 in m1.DefaultIfEmpty()
                        join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on b.GroupCode equals d.Code into d2
                        from d1 in d2.DefaultIfEmpty()
                        join e in _context.MaterialTypes.Where(x => !x.IsDeleted) on b.TypeCode equals e.Code into e2
                        from e1 in e2.DefaultIfEmpty()
                        where ids.Any(x => x == a.Id.ToString())
                        select new InventoryRes
                        {
                            Id = a.Id,
                            ProductCode = a.ProductCode,
                            ProductName = b.ProductName,
                            StoreCode = a.StoreCode,
                            StoreName = f.WHS_Name,
                            LotProductCode = a.LotProductCode,
                            LotProductName = m2.PoTitle,

                            TicketTitle = k.Title,
                            TimeTicketCreate = k.TimeTicketCreate,
                            QrCode = a.ProductQrCode,
                            CreatedTime = a.CreatedTime,
                            Unit = c.ValueSet,
                            ProductGroup = (d1 != null ? d1.Name : ""),
                            ProductType = (e1 != null ? e1.Name : ""),
                            Quantity = a.Quantity,
                            Image = b.Image,
                            PathImg = b.Image
                        };
            var query1 = from a in _context.ProductInStocks.Where(x => !x.IsDeleted && x.ProductType == "SUB_PRODUCT")
                         join b in _context.SubProducts.Where(x => !x.IsDeleted) on a.ProductCode equals b.ProductQrCode
                         join f in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "PR") on a.StoreCode equals f.WHS_Code
                         join c in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Unit)) on a.Unit equals c.CodeSet
                         join h in _context.MaterialProducts.Where(x => !x.IsDeleted && x.TypeCode == "SUB_PRODUCT") on b.ProductCode equals h.ProductCode
                         join j in _context.ProdReceivedDetails.Where(x => !x.IsDeleted) on a.ProductQrCode equals j.ProductQrCode
                         join k in _context.ProdReceivedHeaders.Where(x => !x.IsDeleted) on j.TicketCode equals k.TicketCode
                         join m in _context.PoBuyerHeaders.Where(x => !x.IsDeleted) on a.LotProductCode equals m.PoSupCode into m1
                         from m2 in m1.DefaultIfEmpty()
                         join d in _context.MaterialProductGroups.Where(x => !x.IsDeleted) on h.GroupCode equals d.Code into d2
                         from d1 in d2.DefaultIfEmpty()
                         join e in _context.MaterialTypes.Where(x => !x.IsDeleted) on h.TypeCode equals e.Code into e2
                         from e1 in e2.DefaultIfEmpty()
                         where ids.Any(x => x == a.Id.ToString())
                         select new InventoryRes
                         {
                             Id = a.Id,
                             ProductCode = a.ProductCode,
                             ProductName = b.AttributeName,
                             StoreCode = a.StoreCode,
                             StoreName = f.WHS_Name,
                             LotProductCode = a.LotProductCode,
                             LotProductName = m2.PoTitle,
                             TicketTitle = k.Title,
                             TimeTicketCreate = k.TimeTicketCreate,
                             QrCode = a.ProductQrCode,
                             CreatedTime = a.CreatedTime,
                             Unit = c.ValueSet,
                             ProductGroup = (d1 != null ? d1.Name : ""),
                             ProductType = (e1 != null ? e1.Name : ""),
                             Quantity = a.Quantity,
                             Image = b.Image,
                             PathImg = b.Image,
                         };

            var rs = query.Union(query1).OrderByDescending(x => x.CreatedTime);
            var groupCost = rs.GroupBy(x => new { x.ProductCode, x.ProductType }).Select(y => new InventoryRes
            {
                ProductCode = y.Key.ProductCode,
                ProductType = y.Key.ProductType,
                Total = y.Sum(c => c.Quantity)
            });
            var listData = from a in rs
                      join b in groupCost on new { a.ProductCode, a.ProductType } equals new { b.ProductCode, b.ProductType } into b2
                      from b in b2.DefaultIfEmpty()
                      select new InventoryRes
                      {
                          Id = a.Id,
                          ProductCode = a.ProductCode,
                          ProductName = a.ProductName,
                          StoreCode = a.StoreCode,
                          StoreName = a.StoreName,
                          LotProductCode = a.LotProductCode,
                          LotProductName = a.LotProductName,
                          TicketTitle = a.TicketTitle,
                          TimeTicketCreate = a.TimeTicketCreate,
                          QrCode = a.QrCode,
                          CreatedTime = a.CreatedTime,
                          Unit = a.Unit,
                          ProductGroup = a.ProductGroup,
                          ProductType = a.ProductType,
                          Quantity = a.Quantity,
                          Image = b.Image,
                          PathImg = b.Image,
                          Total = (b != null ? b.Total : 0)
                      };
            var listExport = new List<InventoryExportModel>();
            var no = 1;
            foreach (var item in listData)
            {
                var itemExport = new InventoryExportModel();
                itemExport.No = no;
                itemExport.QrCode = item.QrCode;
                itemExport.LotProductName = item.LotProductName;
                itemExport.ProductName = item.ProductName;
                //itemExport.Quantity = item.FromDate != null ? item.FromDate.ToString("dd/MM/yyyy") : "";
                //itemExport.ToDate = item.ToDate != null ? item.ToDate.ToString("dd/MM/yyyy") : "";
                itemExport.Quantity = item.Quantity;
                itemExport.Unit = item.Unit;
                itemExport.StoreName = item.StoreName;
                itemExport.ProductGroup = item.ProductGroup;
                itemExport.ProductType = item.ProductType;
                itemExport.TicketTitle = item.TicketTitle;
                itemExport.TimeTicketCreate = item.TimeTicketCreate.HasValue ? item.TimeTicketCreate.Value.Date.ToString("dd/MM/yyyy") : "";
                //itemExport.Percent = item.Percent.ToString();

                //if (item.Percent == 100)
                //{
                //    itemExport.Percent = "100%";
                //}
                //else if (item.Percent == 0)
                //{
                //    itemExport.Percent = "0%";
                //}
                //else
                //{
                //    itemExport.Percent = String.Format("{0:0.00}", item.Percent) + "%";
                //}
                no = no + 1;
                listExport.Add(itemExport);
            }

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;

            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("TonKho");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;
            sheetRequest.Range["E1"].ColumnWidth = 24;
            sheetRequest.Range["F1"].ColumnWidth = 24;
            sheetRequest.Range["G1"].ColumnWidth = 24;
            sheetRequest.Range["H1"].ColumnWidth = 24;
            sheetRequest.Range["I1"].ColumnWidth = 24;
            sheetRequest.Range["J1"].ColumnWidth = 24;
            sheetRequest.Range["K1"].ColumnWidth = 24;
            //sheetRequest.Range["J1"].ColumnWidth = 24;


            sheetRequest.Range["A1:K1"].Merge(true);

            sheetRequest.Range["A1"].Text = "TỒN KHO";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 0, 0);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listExport, 2, 1, true);

            sheetRequest["A2"].Text = "TT";
            sheetRequest["B2"].Text = "MÃ QR SẢN PHẨM";
            sheetRequest["C2"].Text = "ĐƠN HÀNG SẢN PHẨM";
            sheetRequest["D2"].Text = "TÊN SẢN PHẨM";
            sheetRequest["E2"].Text = "LUỢNG TỒN";
            sheetRequest["F2"].Text = "ÐƠN VỊ";
            sheetRequest["G2"].Text = "KHO";
            sheetRequest["H2"].Text = "NHÓM SẢN PHẨM";
            sheetRequest["I2"].Text = "LOẠI SẢN PHẨM";
            sheetRequest["J2"].Text = "TÊN PHIẾU NHẬP";
            sheetRequest["K2"].Text = "NGÀY NHẬP";


            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.White;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:K2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:K2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportTonKho" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
        public class InventoryRes
        {
            public int Id { get; set; }
            public string QrCode { get; set; }
            public string Barcode { get; set; }
            public string ProductCode { get; set; }
            public string ProductName { get; set; }
            public string LotProductCode { get; set; }
            public string LotProductName { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string Unit { get; set; }
            public string ProductGroup { get; set; }
            public string ProductType { get; set; }
            public decimal Quantity { get; set; }
            public string Image { get; set; }
            public string StoreCode { get; set; }
            public string StoreName { get; set; }
            public string sQrCode { get; set; }
            public string sBarCode { get; set; }
            public string PathImg { get; set; }
            public decimal Total { get; set; }
            public string TicketTitle { get; set; }
            public DateTime? TimeTicketCreate { get; set; }
        }
        public class InventoryExportModel
        {
            public int No { get; set; }
            public string QrCode { get; set; }
            public string LotProductName { get; set; }
            public string ProductName { get; set; }
            public decimal Quantity { get; set; }
            public string Unit { get; set; }
            public string StoreName { get; set; }
            public string ProductGroup { get; set; }
            public string ProductType { get; set; }
            public string TicketTitle { get; set; }
            public string TimeTicketCreate { get; set; }

        }
    }
}