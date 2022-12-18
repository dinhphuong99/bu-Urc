using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CatActivityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<CatActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CatActivityController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<CatActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }
        public JsonResult JTableCatActivity([FromBody]JTableCatActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CatActivitys
                        join b in _context.CommonSettings on a.ActType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.ActGroup equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where a.IsDeleted == false
                              && (string.IsNullOrEmpty(jTablePara.ActCode) || a.ActCode.ToLower().Contains(jTablePara.ActCode.ToLower()))                        && (string.IsNullOrEmpty(jTablePara.ActName) || a.ActName.ToLower().Contains(jTablePara.ActName.ToLower()))                        && (string.IsNullOrEmpty(jTablePara.ActGroup) || a.ActGroup.ToLower().Equals(jTablePara.ActGroup.ToLower()))                        && (string.IsNullOrEmpty(jTablePara.ActType) || a.ActType.ToLower().Contains(jTablePara.ActType.ToLower()))
                        select new
                        {
                            a.ActCode,
                            a.ID,
                            a.ActName,
                            ActType = b2.ValueSet,
                            ActGroup = c2.ValueSet,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActCode", "ActName", "Note", "ActType", "ActGroup");
            return Json(jdata);
        }
        public class JTableCatActivityModel : JTableModel
        {
            public int ID { get; set; }
            public string ActCode { get; set; }
            public string Note { get; set; }
            public string ActName { get; set; }
            public string ActType { get; set; }
            public string ActGroup { get; set; }
        }

        [HttpPost]        public JsonResult GetListActivityType(string actgroup)        {            var msg = new JMessage { Error = false, Title = "" };            try            {                if (actgroup == "ACTIVITY_GROUP_CARRIAGE")
                {
                    var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_TYPE" && x.Type == "ACTIVITY_GROUP_CARRIAGE").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    msg.Object = data;
                }                else if (actgroup== "ACTIVITY_GROUP_OFFICE")
                {
                    var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_TYPE" && x.Type == "ACTIVITY_GROUP_OFFICE").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    msg.Object = data;
                }                else
                {
                    var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_TYPE" && x.Type == actgroup).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                    msg.Object = data;
                }            }            catch (Exception ex)            {

            }            return Json(msg);        }
        [HttpPost]        public JsonResult GetListActivityGroup()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ACTIVITY_GROUP")).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }

        [NonAction]
        public string GetReqCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.CommonSettings.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "ACT_", "G" + monthNow + ".", yearNow + "_", noText);

            return reqCode;
        }

        [HttpPost]
        public object InsertACTGroup([FromBody]CommonSetting obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(obj.CodeSet));
                if (check == null)
                {
                    var data = new CommonSetting()
                    {
                        CodeSet = GetReqCode(),
                        ValueSet = obj.ValueSet,
                        Group = "ACTIVITY_GROUP",
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CommonSettings.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Thêm nhóm hoạt động thành công"];
                    msg.Code = data.CodeSet;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Đã tồn tại nhóm hoạt động!"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertACTType([FromBody]CommonSetting obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(obj.CodeSet));
                if (check == null)
                {
                    var data = new CommonSetting()
                    {
                        CodeSet = GetReqCode(),
                        ValueSet = obj.ValueSet,
                        Group = "ACTIVITY_TYPE",
                        Type = obj.Type,
                        IsDeleted = false,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CommonSettings.Add(data);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Thêm loại hoạt động thành công"];
                    msg.Code = data.CodeSet;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Đã tồn tại loại hoạt động!"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]        public JsonResult GetListActivityGroupName()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group.Equals("ACTIVITY_GROUP")).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }

        [HttpPost]
        public object InsertCatActivity([FromBody] CatActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.CatActivitys.FirstOrDefault(x => x.ActCode.Equals(obj.ActCode));
                if (check == null)
                {
                    var catActivity = new CatActivity()
                    {
                        ActCode = obj.ActCode,
                        ActGroup = obj.ActGroup,
                        ActType = obj.ActType,
                        ActName = obj.ActName,
                        Note = obj.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CatActivitys.Add(catActivity);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_SUCCESS"];
                    msg.ID = catActivity.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_ISS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object DeleteCatActivity(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.CatActivitys.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_DELETED_ISS_NULL"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateCatActivity([FromBody] CatActivity obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkId = _context.CatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (checkId != null)
                {
                    var data = _context.CatActivitys.FirstOrDefault(x => x.ActCode.Equals(obj.ActCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        data.ActCode = obj.ActCode;
                        data.ActName = obj.ActName;
                        data.ActGroup = obj.ActGroup;
                        data.ActType = obj.ActType;
                        data.Note = obj.Note;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.CatActivitys.Update(data);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_UPDATED_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_UPDATED_FALES"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_UPDATED_FALES"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetItemCatActivity(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.CatActivitys.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }
        
        [HttpPost]
        public JsonResult JTableAttr([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ActivityAttrSetups
                        join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.ActCode.Equals(jTablePara.ActCode))
                        select new
                        {
                            a.AttrCode,
                            a.ID,
                            a.AttrName,
                            AttrUnit = c2.ValueSet,
                            AttrDataType = b2.ValueSet,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "AttrCode", "AttrName", "Note", "AttrDataType", "AttrUnit");
            return Json(jdata);
        }
        public class JTableAttrModel : JTableModel
        {
            public int ID { get; set; }
            public string AttrCode { get; set; }
            public string ActCode { get; set; }
            public string AttrName { get; set; }

            public string AttrDataType { get; set; }

            public string AttrUnit { get; set; }

            public string AttrGroup { get; set; }

            public string Note { get; set; }
        }
        //comobobox
        [HttpPost]        public JsonResult GetListATTRTYPE()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_DATA_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }
        [HttpPost]        public JsonResult GetListATTRUNIT()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ATTR_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }
        //insetr
        [HttpPost]
        public object InsertActAttrSetup([FromBody] ActivityAttrSetup obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {

                var checkexist = _context.CatActivitys.FirstOrDefault(x => x.ActCode.Equals(obj.ActCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_FALES"];

                }
                else
                {
                    var check = _context.ActivityAttrSetups.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode));
                    if (check == null)
                    {
                        var attr = new ActivityAttrSetup()
                        {
                            ActCode = obj.ActCode,
                            AttrCode = obj.AttrCode,
                            AttrName = obj.AttrName,
                            AttrUnit = obj.AttrUnit,
                            AttrDataType = obj.AttrDataType,
                            Note = obj.Note,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.ActivityAttrSetups.Add(attr);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_SUCCESS"];
                        msg.ID = attr.ID;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_IS"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        //delete
        public object DeleteActAttrSetup(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.ActivityAttrSetups.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.ActivityAttrSetups.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["CAT_MSG_ACTIVITY_ADD_CATE_IS_NULL"];
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
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
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