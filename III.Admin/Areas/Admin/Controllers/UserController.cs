using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.ServiceModel;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.EntityFrameworkCore.Storage;
using Remotion.Linq.Parsing.Structure;
using Microsoft.Extensions.Logging;
using ESEIM;
using III.Domain.Enums;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Globalization;

namespace III.Admin.Controllers
{
    public class JTableModelCustom : JTableModel
    {
        public string[] GroupUser { set; get; }
        public string Role { set; get; }
        public string UserName { set; get; }
        public string GivenName { set; get; }
        public string Email { set; get; }
        public string EmployeeCode { set; get; }
        public bool? Status { set; get; }
        public string DepartmentId { set; get; }
        public string BranchId { set; get; }
        public string RoleId { set; get; }
        public int Page { set; get; }
        public int Row { set; get; }
        public int ExportType { set; get; }
    }
    public class ChangeStatusUserModel : JTableModel
    {
        public List<string> ListId { set; get; }
        public string Reason { set; get; }
    }
    [Area("Admin")]
    public class UserController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly UserManager<AspNetUser> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<UserController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;

        public UserController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            UserManager<AspNetUser> roleManager, ILogger<UserController> logger, IHostingEnvironment hostingEnvironment,
            IActionLogService actionLog, IStringLocalizer<UserController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IRepositoryService repositoryService)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }

        public IActionResult Index()
        {
            ViewData["Title"] = _stringLocalizer["ADM_USER_TITLE_USER"];
            return View();
        }

        //[HttpGet("[controller]/[action]/{view}")]
        //public IActionResult GetView(string view)
        //{
        //    return PartialView("_" + view);
        //}

        [HttpPost]
        public object GetGroupResource()
        {
            var rs = _context.AdGroupUsers.OrderBy(x => x.GroupUserId).Select(x => new { Id = x.GroupUserId, Title = x.Title, Code = x.GroupUserCode }).AsNoTracking().ToList();
            return Json(rs);
        }

        [HttpPost]
        public object GetRole()
        {
            var rs = _context.Roles.Where(x => x.Code != "ROOT" && x.Status).OrderBy(x => x.Ord).Select(x => new { x.Id, x.Title, x.Name }).AsNoTracking().ToList();
            return Json(rs);
        }

        [HttpPost]
        public object GetOrganization()
        {
            var rs = GetTreeData(0);
            return Json(rs);
        }

        [HttpPost]
        public object GetDepartment()
        {
            var query = _context.AdDepartments
                .Where(x => x.IsEnabled)
                .OrderBy(o => o.DepartmentCode)
                .Select(x => new
                {
                    Code = x.DepartmentCode,
                    Name = x.Title,
                }).AsNoTracking().ToList();

            return Json(query);
        }

        [HttpPost]
        public object GetBranch()
        {
            //var BranId = _context.VIBOrganizations.Where(x => x.Code == "Branch").Select(x => new { x.Id }).AsNoTracking().SingleOrDefault();
            var rs = GetTreeData(2);
            return Json(rs);
        }

        [HttpPost]
        public object GetProfitCenter()
        {
            //var ProfitCenterId = _context.VIBOrganizations.Where(x => x.Code == "PC").Select(x => new { x.Id }).AsNoTracking().SingleOrDefault();
            //var rs = GetTreeData(3);
            //return Json(rs);

            var query = _context.AdGroupUsers
                .Where(x => x.ParentCode == "P000" && x.IsEnabled)
                .OrderBy(o => o.GroupUserCode)
                .Select(x => new
                {
                    Code = x.GroupUserCode,
                    Name = x.Title,
                }).ToList();

            return Json(query);
        }

        [HttpPost]
        public object GetListRoleCombination()
        {
            return _context.CommonSettings.Where(x => x.Group == EnumHelper<UserEnum>.GetDisplayValue(UserEnum.Combination)).Select(x => new
            {
                Id = x.SettingID,
                Code = x.CodeSet,
                Name = x.ValueSet,
                Check = false
            }).OrderBy(x => x.Id);
        }

        //[HttpPost]
        //public async Task<object> GetAccountExecutive([FromBody] AccountSearch search)
        //{
        //    //var AccountExecutiveId = _context.VIBOrganizations.Where(x => x.Code == "AE").Select(x => new { x.Id }).AsNoTracking().SingleOrDefault();
        //    //var rs = GetTreeData(4);
        //    var listAe = await _context.AdFmAcctExecs
        //                            .Where(x => string.IsNullOrEmpty(search.Name) || x.AcctExec.ToUpper().Contains(search.Name.ToUpper()) || x.AcctExecName.ToUpper().Contains(search.Name.ToUpper()))
        //                            .Skip((search.Page - 1) * search.Row).Take(search.Row)
        //                            .AsNoTracking().ToListAsync();

        //    return Json(listAe);
        //}

        [HttpGet]
        public object GetListGroupRole(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                var query = from a in _context.AdUserInGroups
                            join b in _context.AdGroupUsers on a.GroupUserCode equals b.GroupUserCode
                            join c in _context.Roles on a.RoleId equals c.Id
                            where (a.UserId == id && a.IsMain == false)
                            select new
                            {
                                a.GroupUserCode,
                                GroupUser = b.Title,
                                Role = c.Title,
                                AppCode = a.ApplicationCode,
                                AppName = a.Application.Title,
                            };
                var rs = query.AsNoTracking().ToList();
                return Json(rs);
            }
            return null;
        }

        [NonAction]
        private IActionResult JTable(JTableModelCustom jTablePara, int userType = 0)
        {
            var userId = ESEIM.AppContext.UserId;
            var session = HttpContext.GetSessionUser();
            if (session?.UserId == null)
            {
                session = UserLoginService.GetSessionUser(userId);
                if (session != null)
                {
                    HttpContext.SetSessionUser(session);
                }
                else
                {
                    return RedirectToAction("Logout", "Admin/Account");
                }
            }
            // Get list department and profit center of user login
            var listUserInGroup = new List<AdUserInGroup>();
            if (userType == 1)
            {
                listUserInGroup = _context.AdUserInGroups.Where(x => x.UserId == userId).ToList();
            }
            // Get list branch reference
            var listBranch = new List<string>();
            if (userType == 2)
            {
                var userInGroup = _context.AdUserInGroups.FirstOrDefault(x => x.UserId == userId);   /*&& x.ApplicationCode == _appSettings.ClientId*/
                if (!string.IsNullOrEmpty(userInGroup?.BranchReference))
                {
                    listBranch = userInGroup.BranchReference.Split(',').ToList();
                }
            }
            // Get user data
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.Users
                        join gc in _context.AdOrganizations on a.BranchId equals gc.OrgAddonCode into grpB
                        from c in grpB.DefaultIfEmpty()
                        join ge in _context.AdOrganizations on a.AccountExecutiveId equals ge.OrgAddonCode into grpAC
                        from e in grpAC.DefaultIfEmpty()
                        where a.UserType != 10
                            && (string.IsNullOrEmpty(jTablePara.UserName) || (a.UserName != null && a.UserName.ToLower().Contains(jTablePara.UserName.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.GivenName) || (a.GivenName != null && a.GivenName.ToLower().Contains(jTablePara.GivenName.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.Email) || (a.Email != null && a.Email.ToLower().Contains(jTablePara.Email.ToLower())))
                            && (string.IsNullOrEmpty(jTablePara.EmployeeCode) || (a.EmployeeCode != null && a.EmployeeCode.ToLower().Contains(jTablePara.EmployeeCode.ToLower())))
                            && (jTablePara.Status == null || a.Active == jTablePara.Status)
                            && (string.IsNullOrEmpty(jTablePara.BranchId) || a.BranchId == jTablePara.BranchId)
                            && (jTablePara.DepartmentId == null || a.AdUserInGroups.Any(y => y.UserId == a.Id && y.IsMain && y.GroupUserCode == jTablePara.DepartmentId))
                            && (jTablePara.RoleId == null || a.AdUserInGroups.Any(y => y.UserId == a.Id && y.IsMain && y.RoleId == jTablePara.RoleId))
                            //Điều kiện phân quyền dữ liệu
                            //&& (session.IsAllData
                            //|| (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.UserName))
                            //|| (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.UserName))
                            && session.IsAllData || (!session.IsAllData && session.IsBranch && session.ListUserOfBranch.Any(y => y == a.UserName))
                            || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.UserName)
                            //orderby a.CreatedDate descending
                        select new
                        {
                            a.Id,
                            a.UserName,
                            a.Email,
                            a.FamilyName,
                            a.GivenName,
                            a.MiddleName,
                            a.EmployeeCode,
                            a.CreatedDate,
                            //a.DepartmentId,
                            //a.BranchId,
                            //a.ProfitCenterId,
                            //a.AccountExecutiveId,
                            a.Description,
                            a.Active,
                            a.UserType,
                            a.Reason,
                            a.Picture,
                            a.TypeStaff,
                            FullName = string.Join(" ", a.GivenName, a.FamilyName, a.MiddleName),
                            Role = "",
                            Application = "",
                            Department = a.DepartmentId,//b != null ? b.OrgName : "",
                            Branch = c != null ? string.Join(" - ", c.OrgCode, c.OrgName) : "",
                            ProfitCenter = "",//d != null ? d.OrgName : "",
                            AccountExecutive = a.AccountExecutiveId,//e != null ? e.OrgName : "",

                        };
            var data = query.AsNoTracking().Select(x => new
            {
                x.Id,
                x.UserName,
                x.Email,
                x.FamilyName,
                x.GivenName,
                x.MiddleName,
                x.EmployeeCode,
                x.CreatedDate,
                x.Description,
                x.Active,
                x.UserType,
                x.Reason,
                x.FullName,
                x.Role,
                x.Application,
                GroupUser = "",
                x.Department,
                x.Branch,
                x.TypeStaff,
                x.AccountExecutive,
                x.Picture,

                ListRoleGroup = JsonConvert.SerializeObject((from a in _context.Roles
                                                            join b in _context.AdUserInGroups on a.Id equals b.RoleId into b1
                                                            from b2 in b1.DefaultIfEmpty()
                                                            where b2.IsDeleted == false && b2.UserId.Equals(x.Id)
                                                            select new
                                                            {
                                                                RoleCode = a.Code,
                                                                RoleName = a.Title
                                                            }).DistinctBy(k => k.RoleCode)),
                ListGroup = JsonConvert.SerializeObject((from a in _context.AdGroupUsers
                                                        join b in _context.AdUserInGroups on a.GroupUserCode equals b.GroupUserCode into b1
                                                        from b2 in b1.DefaultIfEmpty()
                                                        where b2.IsDeleted == false && b2.UserId.Equals(x.Id)
                                                        select new
                                                        {
                                                            Code = a.GroupUserCode,
                                                            GroupName = a.Title
                                                        }).DistinctBy(y => y.Code)),

            });
            var data1 = data.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking();

            var count = data1.Count();
            var data2 = data1.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            if (data2.Count > 0)
            {
                var listDepartment = _context.AdUserInGroups.Where(x => data2.Any(y => y.Id == x.UserId && x.IsMain));
                var role = _context.UserRoles.FirstOrDefault(x => data2.Any(y => y.Id == x.UserId));
                data2 = data2.Select(x => new
                {
                    x.Id,
                    x.UserName,
                    x.Email,
                    x.FamilyName,
                    x.GivenName,
                    x.MiddleName,
                    x.EmployeeCode,
                    x.CreatedDate,
                    x.Description,
                    x.Active,
                    x.UserType,
                    x.Reason,
                    x.FullName,
                    Role = listDepartment.Where(y => y.UserId == x.Id).Select(y => y.Role.Title).FirstOrDefault(),
                    //Role = role != null ? _context.Roles.FirstOrDefault(y => y.Id == role.RoleId).Title : null,
                    Application = listDepartment.Where(y => y.UserId == x.Id).Select(y => y.Application.Title).FirstOrDefault(),
                    GroupUser = listDepartment.Where(y => y.UserId == x.Id).Select(y => y.GroupUser.Title).FirstOrDefault(),
                    Department = _context.AdDepartments.Any(y => y.DepartmentCode == x.Department) ? _context.AdDepartments.FirstOrDefault(y => y.DepartmentCode == x.Department).Title : "",
                    x.Branch,
                    x.TypeStaff,
                    x.AccountExecutive,
                    x.Picture,
                    x.ListRoleGroup,
                    x.ListGroup,
                }).ToList();
            }
            var jdata = JTableHelper.JObjectTable(data2, jTablePara.Draw, count, "Id", "CreatedDate", "UserName", "Email", "FamilyName", "FullName", "GivenName", "MiddleName", "EmployeeCode", "GroupUser", "Department", "Branch", "ProfitCenter", "AccountExecutive", "Description", "Active", "TypeStaff", "UserType", "Role", "Application", "Picture", "ListGroup", "ListRoleGroup");
            return Json(jdata);
        }

        //public class DataResource
        //{
        //    public string Id { get; set; }
        //    public string UserName { get; set; }
        //    public string Email { get; set; }
        //    public string FamilyName { get; set; }
        //    public string GivenName { get; set; }
        //    public string MiddleName { get; set; }
        //    public string EmployeeCode { get; set; }
        //    public DateTime CreatedDate { get; set; }
        //    public string Description { get; set; }
        //    public bool Active { get; set; }
        //    public string UserType { get; set; }
        //    public string Reason { get; set; }
        //    public string FullName { get; set; }
        //    public string Role { get; set; }
        //    public string Application { get; set; }
        //    public string GroupUser { get; set; }
        //    public string Department { get; set; }
        //    public string Branch { get; set; }
        //    public string TypeStaff { get; set; }
        //    public string AccountExecutive { get; set; }
        //    public string Picture { get; set; }
        //    public List<ListGroupTemp> ListGroup { get; set; }
        //}
        public class ListGroupTemp
        {
            public string Code { get; set; }
            public string GroupName { get; set; }
        }
        [HttpPost]
        public object JTableOfUser([FromBody] JTableModelCustom jTablePara)
        {
            return JTable(jTablePara, 0);
        }

        [HttpPost]
        public object JTableOfDepartment([FromBody] JTableModelCustom jTablePara)
        {
            return JTable(jTablePara, 1);
        }

        [HttpPost]
        public object JTableOfBranch([FromBody] JTableModelCustom jTablePara)
        {
            return JTable(jTablePara, 2);
        }

        [HttpPost]
        public object JTableOfAdmin([FromBody] JTableModelCustom jTablePara)
        {
            return JTable(jTablePara, 10);
        }
        [HttpPost]
        public async Task<IActionResult> Insert(AspNetUserCustom obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.UserName == obj.UserName);
                if (us == null)
                {
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        obj.Picture = url;
                    }
                    else
                    {
                        obj.Picture = "/images/default/no_user.png";
                    }
                    AspNetUser objtemp = new AspNetUser()
                    {
                        UserName = obj.UserName.ToLower(),
                        Email = obj.Email,
                        PhoneNumber = obj.PhoneNumber,
                        OfficeNumber = obj.OfficeNumber,
                        FamilyName = obj.FamilyName,
                        MiddleName = obj.MiddleName,
                        GivenName = obj.GivenName,
                        EmployeeCode = obj.EmployeeCode,
                        DepartmentId = obj.DepartmentId,
                        BranchId = obj.BranchId,
                        //ProfitCenterId = obj.ProfitCenterId,
                        AccountExecutiveId = obj.AccountExecutiveId,
                        Active = obj.Active,
                        Note = obj.Note,
                        UserType = obj.UserType,
                        Description = obj.Description,
                        CreatedDate = DateTime.Now,
                        CreatedBy = ESEIM.AppContext.UserName,
                        NormalizedEmail = !string.IsNullOrEmpty(obj.Email) ? obj.Email.ToUpper() : null,
                        NormalizedUserName = obj.UserName.ToUpper(),
                        LockoutEnabled = true,
                        Picture = obj.Picture,
                        SecurityStamp = Guid.NewGuid().ToString(),
                        Area = obj.Area,
                        TypeStaff = obj.TypeStaff,
                        RoleCombination = obj.RoleCombination,
                    };
                    await _userManager.CreateAsync(objtemp, obj.Password);
                    //_context.Users.Add(objtemp);
                    //await _context.SaveChangesAsync();

                    // Add or update main role
                    if (!string.IsNullOrEmpty(obj.RoleId))
                    {
                        var userRole = await _context.UserRoles.FirstOrDefaultAsync(x => x.UserId == objtemp.Id);
                        if (userRole != null)
                        {
                            if (userRole.RoleId != obj.RoleId)
                            {
                                // Remove old role
                                _context.Remove(userRole);
                                // Add new role
                                var newUserRole = new IdentityUserRole<string>();
                                newUserRole.UserId = objtemp.Id;
                                newUserRole.RoleId = obj.RoleId;
                                _context.Add(newUserRole);
                            }
                        }
                        else
                        {
                            userRole = new IdentityUserRole<string>();
                            userRole.UserId = objtemp.Id;
                            userRole.RoleId = obj.RoleId;
                            _context.Add(userRole);
                        }

                        //if (string.IsNullOrEmpty(obj.ApplicationCode)) obj.ApplicationCode = "ADMIN";

                        // Add or update main group user

                        if (!string.IsNullOrEmpty(obj.GroupUserCode))
                        {
                            var listGroupUser = obj.GroupUserCode.Split(";");
                            foreach (var itemGroupUser in listGroupUser)
                            {
                                var userInGroup = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.UserId == objtemp.Id && x.GroupUserCode == itemGroupUser && x.IsMain);
                                if (userInGroup == null && !string.IsNullOrEmpty(itemGroupUser))
                                {
                                    userInGroup = new AdUserInGroup();
                                    userInGroup.GroupUserCode = itemGroupUser;
                                    //userInGroup.ApplicationCode = obj.ApplicationCode;
                                    userInGroup.ApplicationCode = "ADMIN";
                                    userInGroup.UserId = objtemp.Id;
                                    userInGroup.RoleId = obj.RoleId;
                                    userInGroup.GrantAll = true;
                                    userInGroup.IsMain = true;
                                    _context.Add(userInGroup); // Add entity
                                }
                                //// Add/Update user permission for department
                                //UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", null, null, null);/* obj.ApplicationCode*/
                            }
                        }

                        // Add or update main profit center
                        var profitCenter = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.UserId == objtemp.Id && x.GroupUserCode == obj.ProfitCenterId && x.IsMain);
                        if (profitCenter == null && !string.IsNullOrEmpty(obj.ProfitCenterId))
                        {
                            profitCenter = new AdUserInGroup();
                            profitCenter.GroupUserCode = obj.ProfitCenterId;
                            //profitCenter.ApplicationCode = obj.ApplicationCode;
                            profitCenter.ApplicationCode = "ADMIN";
                            profitCenter.UserId = objtemp.Id;
                            profitCenter.RoleId = obj.RoleId;
                            profitCenter.GrantAll = true;
                            profitCenter.IsMain = true;
                            _context.Add(profitCenter); // Add entity
                            //                            // Add/Update user permission for profit center
                            //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, "ADMIN", null, null, null); /*obj.ApplicationCode*/
                        }
                    }

                    var result = await _context.SaveChangesAsync();

                    //// Update permission
                    //UpdatePermissionUser(obj.UserType, objtemp.Id, obj.RoleId, obj.DepartmentId);

                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"].Value.ToLower());
                    ////_logger.LogInformation(LoggingEvents.LogDb, "Insert user successfully");

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Nhân Viên Đã Tồn Tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ADM_USER_LBL_USER"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Insert User Fail");
                    ////_actionLog.InsertActionLog("AspNetUsers", "Insert User Fail", null, null, "Error");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Nhân Viên Thêm Thất Bại";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);
                //_logger.LogError(LoggingEvents.LogDb, "Insert User Fail");
                ////_actionLog.InsertActionLog("AspNetUsers", "An error occurred while Insert user", null, null, "Error");

            }
            return Json(msg);
        }
        //[HttpPost]
        //public async Task<JsonResult> Insert([FromBody]AspNetUserCustom obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Insert user");

        //    var msg = new JMessage() { Error = false };

        //    try
        //    {
        //        AspNetUser objtemp = new AspNetUser()
        //        {
        //            UserName = obj.UserName,
        //            Email = obj.Email,
        //            PhoneNumber = obj.PhoneNumber,
        //            OfficeNumber = obj.OfficeNumber,
        //            FamilyName = obj.FamilyName,
        //            GivenName = obj.GivenName,
        //            EmployeeCode = obj.EmployeeCode,
        //            DepartmentId = obj.DepartmentId,
        //            BranchId = obj.BranchId,
        //            ProfitCenterId = obj.ProfitCenterId,
        //            AccountExecutiveId = obj.AccountExecutiveId,
        //            Active = obj.Active,
        //            Note = obj.Note,
        //            Description = obj.Description,
        //            Reason = obj.Reason,
        //            CreatedDate = DateTime.Now,
        //            CreatedBy = EIM.AppContext.UserName
        //        };
        //        //temp.CreatedBy = User.Identity.Name;
        //        obj.Password = "passwordHere";
        //        var x = await _userManager.CreateAsync(objtemp, obj.Password);

        //        for (int i = 0; i < obj.TempSub.IdS.Count(); i++)
        //        {
        //            await _roleManager.AddToRoleAsync(objtemp, obj.TempSub.IdS[i]);
        //        }
        //        for (int i = 0; i < obj.TempSub.IdI.Length; i++)
        //        {
        //            AdUserInGroup objUserInGroup = new AdUserInGroup() { UserId = objtemp.Id, GroupUserId = obj.TempSub.IdI[i] };
        //            _context.AdUserInGroups.Add(objUserInGroup);
        //            _context.SaveChanges();
        //        }

        //        msg.Object = x;
        //        msg.Title = String.Format(_stringLocalizer["MSG_ADD_SUCCESS"), _stringLocalizer["USER_USERNAME").ToLower());
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Insert user successfully");
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Object = ex;
        //        msg.Title = String.Format(_stringLocalizer["MSG_ADD_FAIL"), _stringLocalizer["USER_USERNAME").ToLower());
        //        //_logger.LogError(LoggingEvents.LogDb, "Insert user fail");
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public async Task<IActionResult> Update(AspNetUserCustom obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.Id == obj.Id);
                var objOld = CommonUtil.Clone(us);
                if (us != null)
                {
                    if (obj.Active == false)
                    {
                        var isHasVcWorkPlan = _context.VcWorkPlans.Any(x => !x.IsDeleted && (x.UserName == us.UserName || x.CreatedBy == us.UserName));
                        if (isHasVcWorkPlan)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_ERR_OBJ_USER"], _stringLocalizer["ADM_USER_TITLE_USER"]);
                            return Json(msg);
                        }
                    }
                    if (!string.IsNullOrEmpty(obj.Password))
                    {
                        string codeToken = await _userManager.GeneratePasswordResetTokenAsync(us);
                        var resultReset = await _userManager.ResetPasswordAsync(us, codeToken, obj.Password);
                    }

                    //us.UserName = obj.UserName.ToLower();
                    us.Email = obj.Email;
                    us.PhoneNumber = obj.PhoneNumber;
                    us.OfficeNumber = obj.OfficeNumber;
                    us.FamilyName = obj.FamilyName;
                    us.GivenName = obj.GivenName;
                    us.EmployeeCode = obj.EmployeeCode;
                    us.DepartmentId = obj.DepartmentId;
                    us.BranchId = obj.BranchId;
                    // us.ProfitCenterId = obj.ProfitCenterId;
                    us.AccountExecutiveId = obj.AccountExecutiveId;
                    us.Active = obj.Active;
                    us.UserType = obj.UserType;
                    us.Note = obj.Note;
                    us.Description = obj.Description;
                    us.Reason = obj.Reason;
                    us.UpdatedDate = DateTime.Now;
                    us.UpdatedBy = ESEIM.AppContext.UserName;
                    us.NormalizedEmail = !string.IsNullOrEmpty(obj.Email) ? obj.Email.ToUpper() : null;
                    us.NormalizedUserName = obj.UserName.ToUpper();
                    us.LockoutEnabled = true;
                    us.Area = obj.Area;
                    us.TypeStaff = obj.TypeStaff;
                    us.RoleCombination = obj.RoleCombination;
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        obj.Picture = url;
                        us.Picture = obj.Picture;
                    }

                    _context.Update(us);
                    // Update main role
                    if (!string.IsNullOrEmpty(obj.RoleId))
                    {
                        var userRole = await _context.UserRoles.FirstOrDefaultAsync(x => x.UserId == us.Id);
                        if (userRole != null)
                        {
                            if (userRole.RoleId != obj.RoleId)
                            {
                                // Remove old role
                                _context.Remove(userRole);
                                // Add new role
                                var newUserRole = new IdentityUserRole<string>();
                                newUserRole.UserId = us.Id;
                                newUserRole.RoleId = obj.RoleId;
                                _context.Add(newUserRole);
                            }
                        }
                        else
                        {
                            userRole = new IdentityUserRole<string>();
                            userRole.UserId = us.Id;
                            userRole.RoleId = obj.RoleId;
                            _context.Add(userRole);
                        }
                    }
                    // Add or update main department
                    ////Code cũ - Duy nhất 1 main
                    ////obj.ApplicationCode = obj.ApplicationCode ?? "ADMIN";
                    //var listUserInGroup = await _context.AdUserInGroups.Where(x => x.UserId == us.Id).ToListAsync();
                    //var userInGroup = listUserInGroup.FirstOrDefault(x => x.UserId == us.Id && x.IsMain);
                    //if (userInGroup == null)
                    //{
                    //    userInGroup = listUserInGroup.FirstOrDefault(x => x.UserId == us.Id && x.GroupUserCode == obj.DepartmentId); /* && x.ApplicationCode == obj.ApplicationCode*/
                    //    if (userInGroup == null)
                    //    {
                    //        if (!string.IsNullOrEmpty(obj.DepartmentId))
                    //        {
                    //            userInGroup = new AdUserInGroup();
                    //            userInGroup.GroupUserCode = obj.DepartmentId;
                    //            //userInGroup.ApplicationCode = obj.ApplicationCode;
                    //            userInGroup.ApplicationCode = "ADMIN";
                    //            userInGroup.UserId = us.Id;
                    //            userInGroup.RoleId = obj.RoleId;
                    //            userInGroup.GrantAll = true;
                    //            userInGroup.IsMain = true;
                    //            _context.Add(userInGroup); // Add entity

                    //            // Add/Update user permission for department
                    //            UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", null, null, null);/* obj.ApplicationCode*/
                    //        }
                    //    }
                    //    else
                    //    {
                    //        // Add/Update user permission for department
                    //        //UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, userInGroup.ApplicationCode, userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, userInGroup.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //        UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, "ADMIN");

                    //        // Update user in group
                    //        //userInGroup.ApplicationCode = obj.ApplicationCode;
                    //        userInGroup.ApplicationCode = "ADMIN";
                    //        userInGroup.RoleId = obj.RoleId;
                    //        userInGroup.GrantAll = true;
                    //        userInGroup.IsMain = true;
                    //        _context.Update(userInGroup); // Update entity
                    //    }
                    //}
                    //else
                    //{
                    //    if (string.IsNullOrEmpty(obj.DepartmentId))
                    //    {
                    //        // Add/Update user permission for department
                    //        //UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, userInGroup.ApplicationCode, userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, userInGroup.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //        UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, "ADMIN");

                    //        // Remove department
                    //        _context.Remove(userInGroup);
                    //    }
                    //    else
                    //    {
                    //        if (userInGroup.GroupUserCode != obj.DepartmentId || userInGroup.RoleId != obj.RoleId)   /*|| userInGroup.ApplicationCode != obj.ApplicationCode*/
                    //        {
                    //            var refUserInGroup = listUserInGroup.Where(x => x.IsMain == false && x.UserId == us.Id && x.GroupUserCode == obj.DepartmentId).ToList();  /* && x.ApplicationCode == obj.ApplicationCode*/
                    //            if (refUserInGroup.Count > 0)
                    //            {
                    //                _context.RemoveRange(refUserInGroup); // Remove entity
                    //            }

                    //            // Add/Update user permission for department
                    //            //UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, userInGroup.ApplicationCode, userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, userInGroup.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //            UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", userInGroup.RoleId == obj.RoleId ? null : obj.RoleId, userInGroup.GroupUserCode == obj.DepartmentId ? null : obj.DepartmentId, "ADMIN");

                    //            userInGroup.GroupUserCode = obj.DepartmentId;
                    //            //userInGroup.ApplicationCode = obj.ApplicationCode;
                    //            userInGroup.ApplicationCode = "ADMIN";
                    //            //userInGroup.UserId = us.Id;
                    //            userInGroup.RoleId = obj.RoleId;
                    //            userInGroup.GrantAll = true;
                    //            _context.Update(userInGroup); // Update entity
                    //        }
                    //    }
                    //}



                    // Add or update main department
                    ////Thêm nhiều GroupUser
                    //var listUserInGroup = await _context.AdUserInGroups.Where(x => x.UserId == us.Id).ToListAsync();
                    //var listGroupUser = obj.GroupUserCode.Split(";");
                    //var listDelete = listUserInGroup.Where(x => listGroupUser.All(y => y != x.GroupUserCode)).ToList();
                    //_context.AdUserInGroups.RemoveRange(listDelete);
                    //var listInsert = listGroupUser.Where(x => listUserInGroup.All(y => y.GroupUserCode != x)).ToList();

                    //Thêm nhiều GroupUser
                    //var listUserInGroup = await _context.AdUserInGroups.Where(x => x.UserId == us.Id).ToListAsync();
                    //var listGroupUser = obj.GroupUserCode.Split(";");

                    //var listDelete = listUserInGroup.ToList();
                    //_context.AdUserInGroups.RemoveRange(listDelete);
                    //_context.SaveChanges();

                    //var listInsert = listGroupUser.ToList();
                    //foreach (var itemGroupUser in listInsert)
                    //{
                    //    var userInGroup = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.UserId == obj.Id && x.GroupUserCode == itemGroupUser);   /*&& x.IsMain*/
                    //    if (userInGroup == null && !string.IsNullOrEmpty(itemGroupUser))
                    //    {
                    //        userInGroup = new AdUserInGroup();
                    //        userInGroup.GroupUserCode = itemGroupUser;
                    //        //userInGroup.ApplicationCode = obj.ApplicationCode;
                    //        userInGroup.ApplicationCode = "ADMIN";
                    //        userInGroup.UserId = obj.Id;
                    //        userInGroup.RoleId = obj.RoleId;
                    //        userInGroup.GrantAll = true;
                    //        userInGroup.IsMain = true;
                    //        _context.Add(userInGroup); // Add entity
                    //    }
                    //    //// Add/Update user permission for department
                    //    //UpdatePermissionUserByGroup(_context, userInGroup.GroupUserCode, userInGroup.UserId, userInGroup.RoleId, "ADMIN", null, null, null);/* obj.ApplicationCode*/
                    //}



                    //// Add or update main profit center
                    //var profitCenter = listUserInGroup.FirstOrDefault(x => x.UserId == us.Id && x.IsMain && x.GroupUserCode.StartsWith("p"));
                    //if (profitCenter == null)
                    //{
                    //    profitCenter = listUserInGroup.FirstOrDefault(x => x.UserId == us.Id && x.GroupUserCode == obj.ProfitCenterId);  /*&& x.ApplicationCode == obj.ApplicationCode*/
                    //    if (profitCenter == null)
                    //    {
                    //        if (!string.IsNullOrEmpty(obj.ProfitCenterId))
                    //        {
                    //            profitCenter = new AdUserInGroup();
                    //            profitCenter.GroupUserCode = obj.ProfitCenterId;
                    //            //profitCenter.ApplicationCode = obj.ApplicationCode;
                    //            profitCenter.ApplicationCode = "ADMIN";
                    //            profitCenter.UserId = us.Id;
                    //            profitCenter.RoleId = obj.RoleId;
                    //            profitCenter.GrantAll = true;
                    //            profitCenter.IsMain = true;
                    //            _context.Add(profitCenter); // Add entity
                    //            //// Add/Update user permission for department
                    //            //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, "ADMIN", null, null, null); /*obj.ApplicationCode*/
                    //        }
                    //    }
                    //    else
                    //    {
                    //        // Add/Update user permission for department
                    //        //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, profitCenter.ApplicationCode, profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, profitCenter.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //        //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, "ADMIN", profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, "ADMIN");

                    //        // Update user in group
                    //        //profitCenter.ApplicationCode = obj.ApplicationCode;
                    //        profitCenter.ApplicationCode = "ADMIN";
                    //        profitCenter.RoleId = obj.RoleId;
                    //        profitCenter.GrantAll = true;
                    //        profitCenter.IsMain = true;
                    //        _context.Update(profitCenter); // Update entity
                    //    }
                    //}
                    //else
                    //{
                    //    if (string.IsNullOrEmpty(obj.ProfitCenterId))
                    //    {
                    //        // Add/Update user permission for department
                    //        //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, profitCenter.ApplicationCode, profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, profitCenter.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //        //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, "ADMIN", profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, "ADMIN");

                    //        // Remove main profit center
                    //        _context.Remove(profitCenter);
                    //    }
                    //    else
                    //    {
                    //        if (profitCenter.GroupUserCode != obj.ProfitCenterId || profitCenter.RoleId != obj.RoleId) /* || profitCenter.ApplicationCode != obj.ApplicationCode*/
                    //        {
                    //            var refUserInGroup = listUserInGroup.Where(x => x.IsMain == false && x.UserId == us.Id && x.GroupUserCode == obj.ProfitCenterId).ToList();  /* && x.ApplicationCode == obj.ApplicationCode*/
                    //            if (refUserInGroup.Count > 0)
                    //            {
                    //                _context.RemoveRange(refUserInGroup); // Remove entity
                    //            }

                    //            // Add/Update user permission for department
                    //            //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, profitCenter.ApplicationCode, profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, profitCenter.ApplicationCode == obj.ApplicationCode ? null : obj.ApplicationCode);
                    //            //UpdatePermissionUserByGroup(_context, profitCenter.GroupUserCode, profitCenter.UserId, profitCenter.RoleId, "ADMIN", profitCenter.RoleId == obj.RoleId ? null : obj.RoleId, profitCenter.GroupUserCode == obj.ProfitCenterId ? null : obj.ProfitCenterId, "ADMIN");

                    //            profitCenter.GroupUserCode = obj.ProfitCenterId;
                    //            //profitCenter.ApplicationCode = obj.ApplicationCode;
                    //            profitCenter.ApplicationCode = "ADMIN";
                    //            //profitCenter.UserId = us.Id;
                    //            profitCenter.RoleId = obj.RoleId;
                    //            profitCenter.GrantAll = true;
                    //            _context.Update(profitCenter); // Update entity
                    //        }
                    //    }
                    //}

                    var result = await _context.SaveChangesAsync();
                    //// Update permission
                    //UpdatePermissionUser(obj.UserType, us.Id, obj.RoleId, obj.DepartmentId);
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Nhân viên không tồn tại trong hệ thống !";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EMPLOYEE_NOT_EXITS"], _stringLocalizer["ADM_USER_LBL_USER"]);

                    //_logger.LogError(LoggingEvents.LogDb, "Update User Fail");
                    ////_actionLog.InsertActionLog("AspNetUsers", "Update User Fail", null, null, "Error");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Cập nhật thất bại";
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);

                //_logger.LogError(LoggingEvents.LogDb, "Update User Fail");
                ////_actionLog.InsertActionLog("AspNetUsers", "An error occurred while Update user", null, null, "Error");
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Deactive([FromBody]ChangeStatusUserModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var listUser = _context.Users.Where(x => obj.ListId.Count > 0 && obj.ListId.Any(y => y == x.Id));
                if (listUser.Any())
                {
                    foreach (var us in listUser)
                    {
                        us.Active = false;
                        us.Reason = obj.Reason;
                        us.UpdatedDate = DateTime.Now;
                        us.UpdatedBy = ESEIM.AppContext.UserName;

                        _context.Users.Update(us);
                        _context.Entry(us).State = EntityState.Modified;
                    }
                }

                var successCount = await _context.SaveChangesAsync();
                successCount = successCount / 2;
                if (successCount == obj.ListId.Count)
                {
                    msg.Title = String.Format(_sharedResources["COM_MSG_DEACTIVE_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"]);

                }
                else
                {
                    if (successCount == 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_DEACTIVE_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);

                        //_actionLog.InsertActionLog("ASP_NET_USERS", "Deactive users fail", null, null, "Error");
                    }
                    else
                    {
                        msg.Title = String.Format(_sharedResources["COM_MSG_DEACTIVE_COUNT_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"].Value.ToLower(), successCount.ToString(), obj.ListId.Count.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_DEACTIVE_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);
                //_actionLog.InsertActionLog("ASP_NET_USERS", "Deactive users failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Active([FromBody]ChangeStatusUserModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var listUser = _context.Users.Where(x => obj.ListId.Count > 0 && obj.ListId.Any(y => y == x.Id));
                if (listUser.Any())
                {
                    foreach (var us in listUser)
                    {
                        us.Active = true;
                        us.Reason = obj.Reason;
                        us.UpdatedDate = DateTime.Now;
                        us.UpdatedBy = ESEIM.AppContext.UserName;

                        _context.Users.Update(us);
                        _context.Entry(us).State = EntityState.Modified;
                    }
                }

                var successCount = await _context.SaveChangesAsync();
                successCount = successCount / 2;
                if (successCount == obj.ListId.Count)
                {
                    msg.Title = String.Format(_sharedResources["COM_MSG_ACTIVE_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"]);
                }
                else
                {
                    if (successCount == 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_ACTIVE_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);
                        //_actionLog.InsertActionLog("ASP_NET_USERS", "Active users fail", null, null, "Error");
                    }
                    else
                    {
                        msg.Title = String.Format(_sharedResources["COM_MSG_ACTIVE_COUNT_SUCCESS"], _stringLocalizer["ADM_USER_LBL_USER"].Value.ToLower(), successCount.ToString(), obj.ListId.Count.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_ACTIVE_FAILED"], _stringLocalizer["ADM_USER_LBL_USER"]);
                //_actionLog.InsertActionLog("ASP_NET_USERS", "Active users failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> GetItem(string id)
        {
            try
            {
                //var user = _roleManager.Users.Single(x => x.Id == obj.Id /*&& x.ConcurrencyStamp == obj.ConcurrencyStamp*/);
                //user.AspNetUserRoles = _context.UserRoles.Where(x => x.UserId == user.Id).ToList();
                var user = await _context.Users.Include(i => i.Branch).SingleAsync(x => x.Id == id);

                // Get Branch reference
                List<BranchRef> listBranchRef = new List<BranchRef>();
                var groupBranchRefByApp = _context.AdUserInGroups.Include(i => i.Application).Where(x => x.UserId == user.Id).GroupBy(g => g.Application);
                if (groupBranchRefByApp.Any())
                {
                    foreach (var app in groupBranchRefByApp)
                    {
                        var firstApp = app.First();
                        if (!string.IsNullOrEmpty(firstApp.BranchReference))
                        {
                            if (firstApp.BranchReference == "b_000")
                            {
                                var branchRef = new BranchRef();
                                branchRef.AppCode = app.Key.ApplicationCode;
                                branchRef.AppName = app.Key.Title;
                                branchRef.BranchCode = "000";
                                branchRef.BranchName = "All Branch";
                                // Add to list
                                listBranchRef.Add(branchRef);
                            }
                            else
                            {
                                var listBranchCode = firstApp.BranchReference.Split(',').ToList();
                                var listBranch = _context.AdOrganizations.Where(x => x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && listBranchCode.Any(y => y == x.OrgAddonCode)).OrderBy(o => o.OrgCode).ToList();
                                if (listBranch.Count > 0)
                                {
                                    foreach (var br in listBranch)
                                    {
                                        var branchRef = new BranchRef();
                                        branchRef.AppCode = app.Key.ApplicationCode;
                                        branchRef.AppName = app.Key.Title;
                                        branchRef.BranchCode = br.OrgCode;
                                        branchRef.BranchName = br.OrgName;
                                        // Add to list
                                        listBranchRef.Add(branchRef);
                                    }
                                }
                            }
                        }
                    }
                }
                // Get department / Profit center
                var mainGroup = await _context.AdUserInGroups.Where(x => x.IsMain && x.UserId == user.Id).ToListAsync();
                var role = await _context.UserRoles.Where(x => x.UserId == user.Id).ToListAsync();

                //var mainDepartment = mainGroup.FirstOrDefault(x => !string.IsNullOrEmpty(x.GroupUserCode) && x.GroupUserCode.ToLower().Contains('d'));
                //var mainProfitCenter = mainGroup.FirstOrDefault(x => !string.IsNullOrEmpty(x.GroupUserCode) && x.GroupUserCode.ToLower().Contains('p'));

                var temp = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.PhoneNumber,
                    user.OfficeNumber,
                    user.FamilyName,
                    user.GivenName,
                    user.MiddleName,
                    user.EmployeeCode,
                    user.BranchId,
                    BranchName = user?.Branch == null ? null : string.Format(user?.Branch?.OrgCode + " - " + user?.Branch?.OrgName),
                    user.DepartmentId,
                    GroupUserCode = mainGroup.Any() ? mainGroup.Select(x => x.GroupUserCode).ToArray() : null,
                    //ProfitCenterId = mainProfitCenter?.GroupUserCode,
                    ApplicationCode = mainGroup.Any() ? mainGroup[0]?.ApplicationCode : null,
                    user.Active,
                    user.Description,
                    user.UserType,
                    user.IsExceeded,
                    user.Note,
                    //user.Reason,
                    user.ConcurrencyStamp,
                    RoleId = role.Any() ? role[0].RoleId : null,
                    BranchReference = listBranchRef,
                    user.Picture,
                    user.TypeStaff,
                    //user.TypeWork,
                    user.Area,
                    user.RoleCombination
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "Có lỗi xảy ra", Object = ex });
            }

            //var data = _context.Users.FirstOrDefault(x => x.Id.Equals(id));

            //return Json(data);
        }

        [HttpPost]
        public object GetTreeData(int? id)
        {
            //int temp = 0;
            //if (id != null)
            //{
            //    temp = (int)id;
            //}
            var temp = Convert.ToInt32(id);

            var session = HttpContext.GetSessionUser();

            if (session.IsAllData)
            {
                var data = _context.AdOrganizations.Where(x => (x.OrgGroup == id || temp == 0) && x.IsEnabled)
                    .OrderBy(x => x.OrgCode).AsNoTracking()
                    .Select(x => new { x.OrgCode, x.OrgName, x.OrgAddonCode });
                //var dataOrder = GetSubTreeData(data.ToList(), temp, new List<TreeView>(), "");
                return data;
            }
            else
            {
                var data = _context.AdOrganizations.Where(x => (x.OrgGroup == id || temp == 0) && x.IsEnabled && x.OrgAddonCode == session.BranchId)
                    .OrderBy(x => x.OrgCode).AsNoTracking()
                    .Select(x => new { x.OrgCode, x.OrgName, x.OrgAddonCode }); ;
                //var dataOrder = GetSubTreeData(data.ToList(), temp, new List<TreeView>(), "");
                return data;
            }
        }
        [HttpPost]
        public object GetArea()
        {
            var query = _context.CommonSettings.Where(x => x.Group == EnumHelper<CommonEnum>.GetDisplayValue(CommonEnum.Area) && !x.IsDeleted).Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).AsNoTracking().ToList();
            return query;
        }
        [HttpPost]
        public object GetGroupUser()
        {
            var query = _context.AdGroupUsers.Where(x => x.IsEnabled).Select(x => new { Code = x.GroupUserCode, Name = x.Title }).AsNoTracking().ToList();
            return query;
        }
        [NonAction]
        private List<TreeView> GetSubTreeData(List<AdOrganization> data, int parentid, List<TreeView> lstCategories, string tab)
        {
            tab += "- ";
            var contents = parentid == 0
                ? data.Where(x => x.OrgGroup == null).ToList()
                : data.Where(x => x.OrgGroup == parentid).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.OrgId,
                    Title = tab + item.OrgName,
                    HasChild = data.Any(x => x.OrgGroup == item.OrgId)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.OrgId, lstCategories, tab);
            }
            return lstCategories;
        }

        [HttpPost]
        public JsonResult GetAllStaff()
        {
            var list = (from a in _context.Users
                        select new
                        {
                            a.Id,
                            a.UserName,
                            a.GivenName
                        }).ToList();
            return Json(list);
        }

        [HttpPost]
        public object GetListUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserName != "admin").Select(x => new { UserId = x.Id, x.GivenName, x.Picture, x.UserName, GroupUserCode = x.AdUserInGroups.Select(y => y.GroupUserCode).FirstOrDefault() }).AsNoTracking();
            return query;
        }

        [HttpGet]
        public JsonResult GetListEmployeeCode(string id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = from x in _context.HREmployees.Where(y => y.flag == 1)
                            join b1 in _context.Users on x.Id.ToString() equals b1.EmployeeCode into b2
                            from b in b2.DefaultIfEmpty()
                            where b == null || (b != null && !string.IsNullOrEmpty(id) && b.EmployeeCode == id)
                            select new { Code = x.Id.ToString(), Name = x.fullname, PhoneNumber = x.phone, Email = x.emailuser, x.permanentresidence, DepartmentId = x.unit, RoleId = x.position };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetHrEmployee()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = from x in _context.HREmployees.Where(y => y.flag == 1)
                            join b1 in _context.Users on x.Id.ToString() equals b1.EmployeeCode into b2
                            from b in b2.DefaultIfEmpty()
                            select new { Code = x.Id.ToString(), Name = x.fullname, PhoneNumber = x.phone, Email = x.emailuser, x.permanentresidence, DepartmentId = x.unit, RoleId = x.position };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        #region GroupUserRoleA
        [HttpPost]
        public JsonResult InsertUserGroupRole([FromBody] AdUserInGroup obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AdUserInGroups.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.GroupUserCode.Equals(obj.GroupUserCode) && x.RoleId.Equals(obj.RoleId) && !x.IsDeleted);
                if (data == null)
                {
                    var userInGroup = new AdUserInGroup()
                    {
                        GroupUserCode = obj.GroupUserCode,
                        UserId = obj.UserId,
                        RoleId = obj.RoleId,
                        IsDeleted = false
                    };
                    _context.AdUserInGroups.Add(userInGroup);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult DeleteUserGroupRole(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AdUserInGroups.FirstOrDefault(x => x.UserInGroupId == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.AdUserInGroups.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult JtableUserGroupRole([FromBody] UserGroupRoleModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.AdUserInGroups
                        join b in _context.Users on a.UserId equals b.Id
                        join c in _context.AdGroupUsers on a.GroupUserCode equals c.GroupUserCode
                        join d in _context.Roles on a.RoleId equals d.Id
                        where !a.IsDeleted && a.UserId.Equals(jTablepara.UserId)
                        select new
                        {
                            ID = a.UserInGroupId,
                            GroupTitle = c.Title,
                            UserName = b.GivenName,
                            RoleTitle = d.Title
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "GroupTitle", "RoleTitle");
            return Json(jdata);
        }
        public class UserGroupRoleModel : JTableModel
        {
            public string UserId { get; set; }
            public string Username { get; set; }
            public string RoleName { get; set; }
            public string DepartmentName { get; set; }
        }
        #endregion

        #region
        [HttpPost]
        public JsonResult InsertUserDepartmentRole([FromBody]AdUserDepartment obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AdUserDepartments.FirstOrDefault(x => x.UserId.Equals(obj.UserId) && x.DepartmentCode.Equals(obj.DepartmentCode) && x.RoleId.Equals(obj.RoleId) && !x.IsDeleted);
                if (data == null)
                {
                    var userInDepartment = new AdUserDepartment()
                    {
                        DepartmentCode = obj.DepartmentCode,
                        UserId = obj.UserId,
                        RoleId = obj.RoleId,
                        IsDeleted = false

                    };
                    _context.AdUserDepartments.Add(userInDepartment);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult DeleteUserDepartmentRole(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AdUserDepartments.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AdUserDepartments.Update(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
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
        public JsonResult JtableUserDepartmentRole([FromBody] UserDepartRoleModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = from a in _context.AdUserDepartments
                        join b in _context.Users on a.UserId equals b.Id
                        join c in _context.AdDepartments on a.DepartmentCode equals c.DepartmentCode
                        join d in _context.Roles on a.RoleId equals d.Id
                        where !a.IsDeleted && a.UserId.Equals(jTablepara.UserId)
                        select new
                        {
                            ID = a.ID,
                            DepartmentTitle = c.Title,
                            UserName = b.GivenName,
                            RoleTitle = d.Title
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "DepartmentTitle", "RoleTitle");
            return Json(jdata);
        }
        public class UserDepartRoleModel : JTableModel
        {
            public string UserId { get; set; }
            public string Username { get; set; }
            public string RoleName { get; set; }
            public string DepartmentName { get; set; }
        }
        #endregion

        #region System Log
        [HttpPost]
        public object JTableSystemLog([FromBody]JTableModelSystemLog jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var count = 0;
            var query = new List<SystemLog>();

            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            //Tìm kiếm theo ngày tạo
            var fromDatePara = fromDate.HasValue ? fromDate.Value.ToString("yyyy-MM-dd") : "";
            var toDatePara = toDate.HasValue ? toDate.Value.ToString("yyyy-MM-dd") : "";


            string[] param = new string[] { "@pageNo", "@pageSize", "@departmentCode", "@groupUserCode", "@userName", "@fromDate", "@toDate" };
            object[] val = new object[] { jTablePara.CurrentPage, jTablePara.Length, jTablePara.DepartmentCode, jTablePara.GroupUserCode, jTablePara.UserName, fromDatePara, toDatePara };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_SYSTEM_LOG_VIEW", param, val);
            query = CommonUtil.ConvertDataTable<SystemLog>(rs);
            if (query.Any())
            {
                count = int.Parse(query.FirstOrDefault().TotalRow);
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, count, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
            else
            {
                var jdata = JTableHelper.JObjectTable(query, jTablePara.Draw, 0, "Id", "Name", "Controller", "Action", "RequestBody", "IP", "CreatedBy", "GivenName", "TotalRow", "CreatedTime");
                return Json(jdata);
            }
        }
        public class SystemLog
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Controller { get; set; }
            public string Action { get; set; }
            public string RequestBody { get; set; }
            public string IP { get; set; }
            public string CreatedBy { get; set; }
            public string GivenName { get; set; }
            public string TotalRow { get; set; }
            public string CreatedTime { get; set; }
        }
        public class JTableModelSystemLog : JTableModel
        {
            public string DepartmentCode { get; set; }
            public string GroupUserCode { get; set; }
            public string UserName { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Code { get; set; }
            public string Title { get; set; }
        }
        #endregion

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
    }

    public class UserPerModel
    {
        public string AppCode { set; get; }
        public string UserId { set; get; }
        public string GroupCode { set; get; }
        public string RoleId { set; get; }
        public bool IsExceeded { set; get; }
        public List<GroupUserPermission> GroupUsers { set; get; }
        public List<string> BranchRefs { set; get; }
    }

    public class GroupUserPermission
    {
        public string GroupCode { set; get; }
        public string RoleId { set; get; }
        public List<AdResourcePermission> Resources { set; get; }
    }

    public class GroupUserAll
    {
        public string GroupCode { set; get; }
        public string ParentCode { set; get; }
        public string Title { set; get; }
        public string RoleId { set; get; }
        public bool IsMain { set; get; }
        public bool IsChecked { set; get; }
        public bool HasChild { set; get; }
        public int? Ord { set; get; }
    }

    public class UserApi
    {
        public UserApi()
        {
            List = "/user/JTableOfUser";
        }

        public string List { set; get; }
        public string Insert { set; get; }
        public string Update { set; get; }
    }

    public class BranchRef
    {
        public string AppCode { set; get; }
        public string AppName { set; get; }
        public string BranchCode { set; get; }
        public string BranchName { set; get; }
    }

    public static class IQueryableExtensions
    {
        private static readonly FieldInfo QueryCompilerField = typeof(EntityQueryProvider).GetTypeInfo().DeclaredFields.First(x => x.Name == "_queryCompiler");
        private static readonly TypeInfo QueryCompilerTypeInfo = typeof(QueryCompiler).GetTypeInfo();
        private static readonly PropertyInfo NodeTypeProviderField = QueryCompilerTypeInfo.DeclaredProperties.Single(x => x.Name == "NodeTypeProvider");
        private static readonly MethodInfo CreateQueryParserMethod = QueryCompilerTypeInfo.DeclaredMethods.First(x => x.Name == "CreateQueryParser");
        private static readonly FieldInfo DataBaseField = QueryCompilerTypeInfo.DeclaredFields.Single(x => x.Name == "_database");
        private static readonly FieldInfo QueryCompilationContextFactoryField = typeof(Database).GetTypeInfo().DeclaredFields.Single(x => x.Name == "_queryCompilationContextFactory");

        public static string ToSql<TEntity>(this IQueryable<TEntity> query) where TEntity : class
        {
            if (!(query is EntityQueryable<TEntity>)
                && !(query is InternalDbSet<TEntity>))
            {
                throw new ArgumentException("Invalid query");
            }

            var queryCompiler = (IQueryCompiler)QueryCompilerField.GetValue(query.Provider);
            var nodeTypeProvider =
                (INodeTypeProvider)NodeTypeProviderField.GetValue(queryCompiler);
            var parser = (IQueryParser)CreateQueryParserMethod.Invoke
                (queryCompiler, new object[] { nodeTypeProvider });
            var queryModel = parser.GetParsedQuery(query.Expression);
            var database = DataBaseField.GetValue(queryCompiler);
            var queryCompilationContextFactory =
                (IQueryCompilationContextFactory)QueryCompilationContextFactoryField.GetValue(database);
            var queryCompilationContext = queryCompilationContextFactory.Create(false);
            var modelVisitor =
                (RelationalQueryModelVisitor)queryCompilationContext.CreateQueryModelVisitor();
            modelVisitor.CreateQueryExecutor<TEntity>(queryModel);
            var sql = modelVisitor.Queries.First().ToString();

            return sql;
        }
    }
}