using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;
using Host.Entities;

namespace Host.Services
{
    using IdentityModel;
    using IdentityServer4;
    using System.Security.Claims;

    public class IdentityWithAdditionalClaimsProfileService : IProfileService
    {
        private readonly IUserClaimsPrincipalFactory<ApplicationUser> _claimsFactory;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        public IdentityWithAdditionalClaimsProfileService(UserManager<ApplicationUser> userManager,
            RoleManager<AspNetRole> roleManage,
            IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory)
        {
            _userManager = userManager;  _roleManager = roleManage;
             _claimsFactory = claimsFactory;
        }

        public async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            var sub = context.Subject.GetSubjectId();

            var user = await _userManager.FindByIdAsync(sub);


            var roles=   _userManager.GetRolesAsync(user);  
            var principal = await _claimsFactory.CreateAsync(user); 
            var claims = principal.Claims.ToList();
            claims = claims.Where(claim => context.RequestedClaimTypes.Contains(claim.Type)).ToList();



            foreach (var r in roles.Result)
            {
                claims.Add(new Claim(JwtClaimTypes.Role, r));
            }

            try
            {
                claims.Add(new Claim(JwtClaimTypes.UserName, user.UserName));
                claims.Add(new Claim(JwtClaimTypes.NickName,user.FamilyName+" " + user.GivenName));
                claims.Add(new Claim(JwtClaimTypes.FamilyName, user.FamilyName));
                claims.Add(new Claim(JwtClaimTypes.GivenName, user.GivenName));
                claims.Add(new Claim(JwtClaimTypes.PhoneNumber, user.PhoneNumber));
                //claims.Add(new Claim(JwtClaimTypes.CompanyCode, user.Company_Code));
            }
            catch (Exception)
            { }
            claims.Add(new Claim(IdentityServerConstants.StandardScopes.Email, user.Email)); 
            context.IssuedClaims = claims;
        }

        public async Task IsActiveAsync(IsActiveContext context)
        {
            var sub = context.Subject.GetSubjectId();
            var user = await _userManager.FindByIdAsync(sub);
            context.IsActive = user != null;
        }
    }
}
