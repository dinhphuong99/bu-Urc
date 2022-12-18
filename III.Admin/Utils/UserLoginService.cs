using ESEIM.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public interface IUserLoginService
    {
        SessionUserLogin GetSessionUser(string userId);
    }

    public class UserLoginService : IUserLoginService
    {
        private EIMDBContext _context;
        private IParameterService _parameterService;

        public UserLoginService(EIMDBContext context, IParameterService parameterService)
        {
            _context = context;
            _parameterService = parameterService;
        }

        public SessionUserLogin GetSessionUser(string userId)
        {
            var session = new SessionUserLogin();
            var user = _context.Users.FirstOrDefault(x => x.Id == userId && x.Active == true);
            if (user != null)
            {
                session.Area = user.Area;
                session.TypeStaff = user.TypeStaff;
                session.UserType = (short)user.UserType;
                session.UserId = user.Id;
                session.UserName = user.UserName;
                session.FullName = user.GivenName;
                session.Email = user.Email;
                session.EmployeeCode = user.EmployeeCode;
                session.SessionTimeOut = _parameterService.GetSessionTimeout();
                session.ExpireTimeSpan = DateTime.Now.AddMinutes(session.SessionTimeOut);
                session.Picture = user.Picture;
                session.BranchId = user.BranchId;
                session.DepartmentCode = user.DepartmentId;

                session.ListGroupUser = _context.AdUserInGroups.Where(x => x.UserId == userId).Select(x => x.GroupUserCode).ToList();
                session.ListDepartment = _context.AdUserDepartments.Where(x => x.UserId == userId).Select(x => x.DepartmentCode).ToList();
                //session.ListDepartment = _context.AdOrganizations.FirstOrDefault(x => x.OrgAddonCode == user.BranchId).DepartmentCode.Split(",", StringSplitOptions.None).ToList();
                if (!session.ListDepartment.Any(x => x.Equals(user.DepartmentId)))
                    session.ListDepartment.Add(user.DepartmentId);

                session.ListUser = _context.Users.Where(x => x.BranchId == user.BranchId && x.Active).Select(x => x.Id).ToList();
                var userInBranch = _context.Users.Where(x => x.Active && x.BranchId == user.BranchId);
                session.ListProject = _context.Projects.Where(x => !x.FlagDeleted && userInBranch.Any(p => p.UserName.Equals(x.CreatedBy))).Select(x => x.ProjectCode).ToList();
                session.ListContract = _context.PoSaleHeaders.Where(x => !x.IsDeleted && userInBranch.Any(p => p.UserName.Equals(x.CreatedBy))).Select(x => x.ContractCode).ToList();
                var roleCode = (from a in _context.UserRoles.Where(x => x.UserId == userId)
                                join b in _context.Roles on a.RoleId equals b.Id
                                select b).FirstOrDefault();
                var roleId = "";
                if (roleCode != null)
                {
                    session.RoleCode = roleCode.Code;
                    roleId = roleCode.Id;
                }

                var permissions = _context.AdPermissions
                                            .Where(x => string.IsNullOrEmpty(x.UserId) && session.ListGroupUser.Count() > 0 && session.ListGroupUser.Any(y => y == x.GroupUserCode) && x.RoleId == roleId)
                                            .Select(x => new PermissionObject
                                            {
                                                //FunctionId = x.FunctionId,
                                                FunctionCode = x.Function.FunctionCode,
                                                FunctionTitle = x.Function.Title,
                                                //ResourceId = x.ResourceId,
                                                ResourceCode = x.Resource.ResourceCode,
                                                ResourceTitle = x.Resource.Title,
                                                ResourceApi = x.Resource.Api,
                                                GroupUserCode = x.GroupUserCode,
                                                GroupUserTitle = x.GroupUser.Title,
                                                RoleId = x.RoleId,
                                                RoleTitle = x.Role.Title,
                                            });
                session.Permissions = permissions.ToList();

                //Get ra đối tượng view dữ liệu, list username nếu là đối tượng quản lý chi nhánh
                //if (session.UserType == 10 || session.ListGroupUser.Any(x => x == "BGD" || x == "QTHT"))
                //{
                //    session.IsAllData = true;
                //}
                //else
                //{
                //    if (session.RoleCode == "GIAMDOC")
                //    {
                //        session.IsBranch = true;
                //        session.ListUserOfBranch = _context.Users.Where(x => x.BranchId == user.BranchId && x.Active == true).Select(x => x.UserName).ToList();
                //    }
                //    else
                //    {
                //        session.IsUser = true;
                //    }
                //}
                if(session.UserType == 10 || session.DepartmentCode == "DEPARTMENT_LEADER" && session.BranchId == "b_ALL")
                {
                    session.IsAllData = true;
                }
                else if(session.BranchId != "b_ALL")
                {
                    if(session.DepartmentCode == "DEPARTMENT_LEADER")
                    {
                        session.IsBranch = true;
                        session.ListUserOfBranch = _context.Users.Where(x => x.BranchId == user.BranchId && x.Active).Select(x => x.UserName).ToList();
                    }
                    else
                    {
                        session.IsUser = true;

                    }
                }
            }
            return session;
        }
    }
}
