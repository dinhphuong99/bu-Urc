using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using Syncfusion.EJ2.PdfViewer;
using Newtonsoft.Json;
using System.Drawing;
//using SautinSoft;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;

namespace III.Admin.Controllers
{
    //[EnableCors("AllowSpecificOrigin")]
    public class ExcelViewerController : Controller
    {
        private IHostingEnvironment _hostingEnvironment;
        private IMemoryCache _cache;
        public ExcelViewerController(IHostingEnvironment hostingEnvironment, IMemoryCache cache)
        {
            _hostingEnvironment = hostingEnvironment;
            _cache = cache;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Open(IFormCollection openRequest)
        {
            var url = openRequest.First().Value.First();

            var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, url);

            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile file = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
            OpenRequest open = new OpenRequest();
            open.File = file;
            var rs = Workbook.Open(open);
            return Content(rs);
        }

        [HttpPost]
        public IActionResult GetDataFile(string url)
        {
            var pathUpload = _hostingEnvironment.WebRootPath+"/" + url;

            Stream fileStreamPath = new FileStream(pathUpload, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            FormFile file = new FormFile(fileStreamPath, 0, fileStreamPath.Length, "Test", "Test.xlsx");
            OpenRequest open = new OpenRequest();
            open.File = file;

            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            IWorkbook workbook = application.Workbooks.Create();
            workbook = application.Workbooks.Open(file.OpenReadStream());
            var worksheets = workbook.Worksheets;
            var listData = new List<Object>();

            foreach (var item in worksheets)
            {
                var worksheet = item;
                var data = new List<Object>();
                var dataRow = new List<Object>();
                if (worksheet.Rows.Length > 1)
                {
                    var length = worksheet.Rows.Length;
                    var alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToArray();
                    for (int i = 1; i <= length + 1; i++)
                    {
                        dataRow = new List<Object>();
                        for (int j = 0; j < alphas.Length; j++)
                        {
                            var col = alphas[j].ToString() + i;
                            var obj = new
                            {
                                name = worksheet.GetValueRowCol(i, j).ToString(),
                                value = worksheet.Range[col + ""].DisplayText
                            };
                            //if (!string.IsNullOrEmpty(obj.name) || !string.IsNullOrEmpty(obj.value))
                            dataRow.Add(obj);
                        }
                        data.Add(dataRow);
                    }
                }

                var sheet = new
                {
                    name = worksheet.Name,
                    data
                };
                listData.Add(sheet);
            }

            var rs = JsonConvert.SerializeObject(listData);
            return Content(rs);
        }
        public string Save(SaveSettings saveSettings)
        {
            //ExcelEngine excelEngine = new ExcelEngine();
            //IApplication application = excelEngine.Excel;
            try
            {
                // Convert Spreadsheet data as Stream
                //Stream fileStream = Workbook.Save<Stream>(saveSettings);
                //IWorkbook workbook = application.Workbooks.Open(fileStream);
                //var filePath = _hostingEnvironment.WebRootPath + saveSettings.FileName + ".xlsx";
                //workbook.SaveAs(filePath);
                return "Success";
            }
            catch (Exception ex)
            {
                return "Failure";
            }
        }
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
