using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerReminderController : BaseController
    {
        public class ReminderJtable : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public int? CustomerId { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CustomerReminderController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public CustomerReminderController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<CustomerReminderController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]ReminderJtable jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromDate == null && toDate == null && jTablePara.CustomerId == null)
            {
                fromDate = today;
                toDate = today;
            }
            var query = from a in _context.CustomerReminders
                        where ((jTablePara.CustomerId == null) || (a.CustomerId == jTablePara.CustomerId))
                        && ((fromDate == null) || (a.ReminderTime.HasValue && a.ReminderTime.HasValue && a.ReminderTime.Value.Date >= fromDate))
                        && ((toDate == null) || (a.ReminderTime.HasValue && a.ReminderTime.HasValue && a.ReminderTime.Value.Date <= toDate))
                        select new
                        {
                            a.Id,
                            ReminderName = _context.ReminderAttrs.FirstOrDefault(x => x.ReminderCode == a.ReminderCode).ReminderTitle ?? null,
                            a.ReminderTime,
                            a.Note,
                            a.CreatedBy,
                            a.CreatedTime,
                            CustomerName = _context.Customerss.FirstOrDefault(x => x.CusID == a.CustomerId).CusName ?? null,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ReminderTime", "ReminderName", "Note", "CreatedBy", "CreatedTime", "CustomerName");
            return Json(jdata);
        }

        [HttpPost]
        public object GetCustomer()
        {
            var data = _context.Customerss.Select(x => new
            {
                Id = x.CusID,
                Name = x.CusName
            });
            return data;
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