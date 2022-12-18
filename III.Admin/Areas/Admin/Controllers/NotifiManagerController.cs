using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class NotifiManagerController : Controller
    {
        public class ProjectManagementJtable : JTableModel
        {
            public string UserId { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Status { get; set; }
            public string DueDate { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<NotifiManagerController> _stringLocalizer;
        private readonly IStringLocalizer<CardJobController> _cardJobController;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public NotifiManagerController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<NotifiManagerController> stringLocalizer, IStringLocalizer<CardJobController> cardJobController, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _cardJobController = cardJobController;
            _sharedResources = sharedResources;
        }
        public IActionResult Index(string userId)
        {
            ViewBag.userId = userId;
            return View();
        }

        #region Index
        [HttpPost]
        public object JTable([FromBody]ProjectManagementJtable jTablePara)
        {
            var session = HttpContext.GetSessionUser();
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                        join b in _context.Users on a.CreatedBy equals b.UserName into b1
                        from b2 in b1.DefaultIfEmpty()
                        where (a.CreatedBy == session.UserName || a.LstUser.Contains(session.UserId))
                        && (string.IsNullOrEmpty(a.ListUserView) || !a.ListUserView.Contains(session.UserId))
                        && ((string.IsNullOrEmpty(jTablePara.Code)) || (a.CardCode.ToLower().Contains(jTablePara.Code.ToString())))
                        && ((string.IsNullOrEmpty(jTablePara.Name)) || (a.CardName.ToLower().Contains(jTablePara.Name.ToLower())))
                        && ((string.IsNullOrEmpty(jTablePara.Status)) || (a.Status == jTablePara.Status))
                        && ((string.IsNullOrEmpty(jTablePara.FromDate)) || (a.CreatedDate.Date >= fromDate.Value.Date))
                        && ((string.IsNullOrEmpty(jTablePara.ToDate)) || (a.CreatedDate.Date <= toDate.Value.Date))
                         select new
                        {
                            CardID = a.CardID,
                            CardCode = a.CardCode,
                            CardName = a.CardName,
                            Deadline = a.Deadline,
                            Completed = a.Completed,
                            BeginTime = a.BeginTime,
                            Status = _context.CommonSettings.FirstOrDefault(y => y.CodeSet.Equals(a.Status)).ValueSet,
                            EndTime = a.EndTime,
                            UpdateTime = a.UpdatedTime,
                            CreatedBy = b2.GivenName,
                            CreatedTime = a.CreatedDate.ToString("dd/MM/yyyy"),
                            UpdatedTimeTxt = a.UpdatedTime.HasValue ? a.UpdatedTime.Value.ToString("dd/MM/yyyy") : "",
                            WorkType = !string.IsNullOrEmpty(a.WorkType) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkType).ValueSet : "",
                            Priority = !string.IsNullOrEmpty(a.CardLevel) ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.CardLevel).ValueSet : "",
                        }).DistinctBy(x => x.CardCode).OrderByDescending(x => x.UpdateTime).ThenByDescending(x => x.CardID);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(
                                data,
                                jTablePara.Draw,
                                count,
                                "CardID", "CardCode", "CardName", "ListName", "Deadline", "Status",
                                "Completed", "BeginTime", "EndTime", "Cost", "Currency", "CreatedBy", "CreatedTime",
                                "Priority", "WorkType", "UpdatedTimeTxt", "UpdateTime"
                                );
            return Json(jdata);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_cardJobController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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