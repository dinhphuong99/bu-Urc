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
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ActivityController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<ActivityController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ActivityController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
            IStringLocalizer<ActivityController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTableActivity([FromBody]JTableActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CatWorkFlows
                        where a.IsDeleted == false
                        && (string.IsNullOrEmpty(jTablePara.WorkFlowCode) || a.WorkFlowCode.ToLower().Contains(jTablePara.WorkFlowCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Name) || a.Name.ToLower().Contains(jTablePara.Name.ToLower()))
                        select new
                        {
                            a.WorkFlowCode,
                            a.ID,
                            a.Name,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "WorkFlowCode", "Name", "Note");
            return Json(jdata);
        }


        [HttpPost]
        public object Insert([FromBody] CatWorkFlow obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.CatWorkFlows.FirstOrDefault(x => x.WorkFlowCode.Equals(obj.WorkFlowCode));
                if (check == null)
                {
                    var catActivity = new CatWorkFlow()
                    {
                        WorkFlowCode = obj.WorkFlowCode,
                        Name = obj.Name,
                        Note = obj.Note,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.CatWorkFlows.Add(catActivity);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_ADD_SUCCESS"];
                    msg.ID = catActivity.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CODE_IS"];
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
        public object GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.CatWorkFlows.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody] CatWorkFlow obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkId = _context.CatWorkFlows.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (checkId != null)
                {
                    var data = _context.CatWorkFlows.FirstOrDefault(x => x.WorkFlowCode.Equals(obj.WorkFlowCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        data.WorkFlowCode = obj.WorkFlowCode;
                        data.Name = obj.Name;
                        data.Note = obj.Note;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.CatWorkFlows.Update(data);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR"];
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
        public object Delete(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CatWorkFlows.FirstOrDefault(x => !x.IsDeleted && x.ID == id);

                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.CatWorkFlows.Update(data);
                    _context.SaveChanges();

                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public class JTableActivityModel : JTableModel
        {
            public int ID { get; set; }
            public string WorkFlowCode { get; set; }
            public string Note { get; set; }
            public string Name { get; set; }
        }


        //CatActivity

        //table
        public JsonResult JTableCatActivity([FromBody]JTableActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CatActivitys
                        join b in _context.CommonSettings on a.ActType equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.ActGroup equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where a.IsDeleted == false
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

        #region Index
        //combobox
        [HttpPost]        public JsonResult GetListActivityType()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }
        [HttpPost]        public JsonResult GetListActivityGroup()        {            var msg = new JMessage { Error = false, Title = "" };            try            {                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_GROUP").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });                if (data != null)                {                    msg.Object = data;                }                else                {                    msg.Error = true;                    msg.Title = "Không tồn tại dữ liệu!";                }            }            catch (Exception ex)            {                msg.Error = true;                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }            return Json(msg);        }

        //insert
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
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_ADD_SUCCESS1"];
                    msg.ID = catActivity.ID;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CODE_IS1"];
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


                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR1"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //update
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
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_SUCCESS1"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR1"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_UPDATED_ERR1"];
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
        //Act Attr setup
        //table
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
            public string WorkFlowCode { get; set; }
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
                    msg.Title = _stringLocalizer["Lưu danh đối tượng trước khi thêm hoạt động!"];

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
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_ADD_SUCCESS"];
                        msg.ID = attr.ID;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_CODE_IS"];
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

                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CAT_ADD_ERR"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #endregion

        #region obj_activity
        [HttpPost]        public object GetActivity()        {            var data = _context.CatActivitys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ActCode, Name = x.ActName }).ToList();            return data;        }

        [HttpPost]        public object GetUnit()        {            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "GROUP_ACTIVITY_PROPERTY").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();            return data;        }

        [HttpPost]        public object GetPriority()        {            var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "ACTIVITY_PRIORITY").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();            return data;        }

        [HttpPost]
        public object InsertObjActivity([FromBody]WorkflowActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {

                var checkexist = _context.CatWorkFlows.FirstOrDefault(x => x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.IsDeleted == false);
                if (checkexist == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_CATE_ADD_FALSE"];

                }
                else
                {
                    var checkPriority = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.Priority.Equals(obj.Priority) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                    if (checkPriority == null)
                    {
                        var check = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                        if (check == null)
                        {
                            var attr = new WorkflowActivity()
                            {
                                ActCode = obj.ActCode,
                                WorkFlowCode = obj.WorkFlowCode,
                                UnitTime = obj.UnitTime,
                                LimitTime = obj.LimitTime,
                                Priority = obj.Priority,
                                Note = obj.Note,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now
                            };
                            _context.ObjectActivitys.Add(attr);
                            _context.SaveChanges();
                            msg.Title = _stringLocalizer["ACT_MSG_ADD_CATE_FOR_ACTI_SUCCESS"];
                            msg.ID = attr.ID;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["ACT_MSG_ADD_CATE_FOR_ACTI_ERR"];
                        }
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["Thứ tự đã tồn tại!"];
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

        [HttpPost]
        public object UpdatedObjActivity([FromBody]WorkflowActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                if (check != null)
                {
                    check.ActCode = obj.ActCode;
                    check.UnitTime = obj.UnitTime;
                    check.LimitTime = obj.LimitTime;
                    check.Priority = obj.Priority;
                    check.Note = obj.Note;
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
             
                    _context.ObjectActivitys.Update(check);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["Cập nhật thành công"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["Không tìm thấy đối tượng!"];
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
        public JsonResult GetProperties(string ActCode)
        {
            var data = _context.ActivityAttrSetups.Where(x => !x.IsDeleted && x.ActCode == ActCode).Select(x => new { Code = x.AttrCode, Name = x.AttrName });
            return Json(data);
        }

        [HttpPost]        public object GetObjActivity(string code)        {            var data = (from a in _context.ObjectActivitys                        where a.IsDeleted == false && a.WorkFlowCode == code                        select new
                        {
                            a.ID,
                            ActCode = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            Priority = a.Priority,
                            a.LimitTime,
                            a.UnitTime,
                            a.Note
                        }).ToList();            return data;        }

        [NonAction]
        public string getBranch(string code1, string code2)
        {
            var data = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == code1 && x.ActCode == code2)
                .Select(x => new { x.BranchCode }).ToList();
            var str = "";
            foreach (var item in data)
            {
                str += item.BranchCode;
            }
            return str;
        }

        [NonAction]
        public string getDepart(string code1, string code2)
        {
            var data = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == code1 && x.ActCode == code2)
                .Select(x => new { x.DepartCode }).ToList();
            var str = "";
            foreach (var item in data)
            {
                str += item.DepartCode;
            }
            return str;
        }

        [HttpPost]
        public JsonResult JTableActivityFlow([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.ObjectActivitys
                        join b in _context.CatActivitys on a.ActCode equals b.ActCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.CommonSettings on a.UnitTime equals c.CodeSet into c1
                        from c2 in c1.DefaultIfEmpty()
                        where (!a.IsDeleted && a.WorkFlowCode.Equals(jTablePara.WorkFlowCode))
                        select new
                        {
                            a.ID,
                            ActCode = b2 != null ? b2.ActName : "",
                            Priority = a.Priority,
                            a.LimitTime,
                            UnitTime = c2.CodeSet != null ? c2.ValueSet : "",
                            a.Note,
                            Branch = a.Branch,
                            Department = a.Department,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActCode", "Priority", "LimitTime", "UnitTime", "Note", "Branch", "Department");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItemActivity(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.ObjectActivitys.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }
        [HttpPost]
        public object DeleteActivity(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.ObjectActivitys.FirstOrDefault(x => x.ID == id);
                var checkWorkFlow = _context.WorkflowActivityRoles.Where(x => x.ActCode == check.ActCode && x.WorkFlowCode == check.WorkFlowCode && !x.IsDeleted).Select(x => new { x }).ToList();
                if(checkWorkFlow.Count > 0)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_NOT_NULL"];
                }
                else
                {
                    if (check != null)
                    {
                        check.IsDeleted = true;
                        _context.ObjectActivitys.Update(check);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["ACT_MSG_DEL_CATE_FOR_ACTI_ERR"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACT_MSG_ACTIVITY_DELETED_ERR"];
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

        [HttpPost]

        #endregion

        #region extend
        public JsonResult InsertWorkflowActRole([FromBody] WorkflowActivityRole obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkobj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                if (checkobj == null)
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng kiểm tra lại luồng công việc và hoạt động";
                }
                else
                {
                    var check = _context.WorkflowActivityRoles.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode && x.ActCode == obj.ActCode
                    && x.BranchCode == obj.BranchCode && x.DepartCode == obj.DepartCode && x.Role == obj.Role && x.WorkFlowProperty == obj.WorkFlowProperty);
                    if (check == null)
                    {
                        var workFlowActivityRole = new WorkflowActivityRole
                        {
                            WorkFlowCode = obj.WorkFlowCode,
                            ActCode = obj.ActCode,
                            BranchCode = obj.BranchCode,
                            DepartCode = obj.DepartCode,
                            Role = obj.Role,
                            WorkFlowProperty = obj.WorkFlowProperty,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.WorkflowActivityRoles.Add(workFlowActivityRole);
                        _context.SaveChanges();
                        msg.Title = "Thêm thành công";

                        var checkObj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(obj.ActCode) && x.WorkFlowCode.Equals(obj.WorkFlowCode));
                        checkObj.Branch = checkObj.Branch != null ? checkObj.Branch+ "," + obj.BranchCode : obj.BranchCode;
                        checkObj.Department = checkObj.Department != null ? checkObj.Department + "," + obj.DepartCode : obj.DepartCode;
                        _context.ObjectActivitys.Update(checkObj);
                        _context.SaveChanges();
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Đã tồn tại luồng và hoạt động";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra";
            }
            return Json(msg);
        }

        [HttpPost]        public object GetWorkFlow(string code)        {            var data = (from a in _context.WorkflowActivityRoles                        where a.IsDeleted == false && a.WorkFlowCode == code                        select new
                        {
                            a.ID,
                            ActCode = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            Branch = a.BranchCode != null ? _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == a.BranchCode).OrgName : "",
                            DepartCode = a.DepartCode != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartCode).Title : "",
                            Role = a.Role != null ? _context.Roles.FirstOrDefault(x => x.Id == a.Role).Title : "",
                            Property = a.WorkFlowProperty != null ? _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.WorkFlowProperty).ValueSet : "",
                        }).ToList();            return data;        }

        [HttpPost]
        public JsonResult JTableWorkFlow([FromBody]JTableAttrModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == jTablePara.WorkFlowCode && x.ActCode == jTablePara.ActCode)

                        select new
                        {
                            a.ID,
                            ActName = a.ActCode != null ? _context.CatActivitys.FirstOrDefault(x => x.ActCode == a.ActCode).ActName : "",
                            BranchName = a.BranchCode != null ? _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == a.BranchCode).OrgName : "",
                            DepartmentName = a.DepartCode != null ? _context.AdDepartments.FirstOrDefault(x => x.DepartmentCode == a.DepartCode).Title : "",
                            Role = a.Role != null ? _context.Roles.FirstOrDefault(x => x.Code == a.Role).Title : "",
                            Property = a.WorkFlowProperty != null ? _context.ActivityAttrSetups.FirstOrDefault(x => !x.IsDeleted && x.AttrCode == a.WorkFlowProperty).AttrName : "",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActName", "DepartmentName", "BranchName", "Role", "Property");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult DeleteWorkflowActRole(int id)
        {
            var msg = new JMessage();
            var data = _context.WorkflowActivityRoles.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.WorkflowActivityRoles.Update(data);
                _context.SaveChanges();
                msg.Title = "Xóa thành công";

                var checkObj = _context.ObjectActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode.Equals(data.ActCode) && x.WorkFlowCode.Equals(data.WorkFlowCode));
                if (checkObj.Branch != null && checkObj.Branch != "")
                {
                    string[] listBranch = checkObj.Branch.Split(",");
                    List<string> list = new List<string>(listBranch);
                    for (int i = 0; i < listBranch.Length; i++)
                    {
                        if (listBranch[i] == data.BranchCode)
                        {
                            list.Remove(listBranch[i]);
                        }
                    }
                    checkObj.Branch = list.Join(",");
                    _context.ObjectActivitys.Update(checkObj);
                    _context.SaveChanges();
                }
                
            }
            else
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy luồng và hoạt động";
            }
            return Json(msg);
        }
        #endregion

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