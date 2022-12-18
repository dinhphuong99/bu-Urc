 
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;
using System.Collections.Generic;
using System.Security.Claims;

namespace Host.Configuration
{
    public class Clients
    {
        public static IEnumerable<Client> Get()
        {
            return new List<Client>
            {
                
                new Client
                {
                    ClientId = "client",
                    ClientSecrets =
                    {
                        new Secret("secret".Sha256())
                    },

                    AllowedGrantTypes = GrantTypes.ClientCredentials,
                    AllowedScopes = { "api1", "api2.read_only" },
                },
                 
                new Client
                {
                    ClientId = "roclient",
                    ClientSecrets = 
                    {
                        new Secret("secret".Sha256())
                    },

                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,

                    AllowOfflineAccess = true,
                    AllowedScopes = 
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        "custom.profile",
                        "api1", "api2.read_only"
                    }
                }, 
                new Client
                {
                    ClientId = "roclient.public",
                    RequireClientSecret = false,

                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,

                    AllowOfflineAccess = true,
                    AllowedScopes = 
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Email,
                        "api1", "api2.read_only"
                    }
                }, 
                new Client
                {
                    ClientId = "console.hybrid.pkce",
                    ClientName = "Console Hybrid with PKCE Sample",
                    RequireClientSecret = false,

                    AllowedGrantTypes = GrantTypes.Hybrid,
                    RequirePkce = true,

                    RedirectUris = { "http://127.0.0.1:7890/" },

                    AllowOfflineAccess = true,

                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "api1", "api2.read_only",
                    },
                },

                ///////////////////////////////////////////
                // Introspection Client Sample
                //////////////////////////////////////////
                new Client
                {
                    ClientId = "roclient.reference",
                    ClientSecrets = 
                    {
                        new Secret("secret".Sha256())
                    },

                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,
                    AllowedScopes = { "api1", "api2.read_only" },

                    AccessTokenType = AccessTokenType.Reference
                }, 
                new Client
                {
                    ClientId = "mvc.implicit",
                    ClientName = "MVC Implicit",
                    ClientUri = "",

                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowAccessTokensViaBrowser = true,

                    RedirectUris =  { "http://localhost:44077/signin-oidc" },
                    LogoutUri = "http://localhost:44077/signout-oidc",
                    PostLogoutRedirectUris = { "http://localhost:44077/" },

                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "api1", "api2.read_only"
                    },
                }, 
                new Client
                {
                    ClientId = "mvc.manual",
                    ClientName = "MVC Manual",
                    ClientUri = "",

                    AllowedGrantTypes = GrantTypes.Implicit,

                    RedirectUris = { "http://localhost:44077/home/callback" },
                    LogoutUri = "http://localhost:44077/signout-oidc",
                    PostLogoutRedirectUris = { "http://localhost:44077/" },

                    AllowedScopes = { IdentityServerConstants.StandardScopes.OpenId },
                }, 
                new Client
                {
                    ClientId = "mvc",
                    ClientName = "MVC Hybrid",
                    ClientUri = "",

                    ClientSecrets = 
                    {
                        new Secret("secret".Sha256())
                    },
                    
                    AllowedGrantTypes = GrantTypes.Hybrid,
                    AllowAccessTokensViaBrowser = false,
                    RequireConsent = false,

                    RedirectUris = { "http://localhost:6002/signin-oidc", "http://117.6.131.222:4010/signin-oidc" },
                    LogoutUri = "http://localhost:6002/signout-oidc",
                    PostLogoutRedirectUris = { "http://localhost:6002/signout-callback-oidc", "http://117.6.131.222:4010/signout-callback-oidc" },

                    AllowOfflineAccess = true,

                    AllowedScopes = 
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "api1", "api2.read_only",
                    },
                }, 
                new Client
                {
                    ClientId = "js_oauth",
                    ClientName = "JavaScript OAuth 2.0 Client",
                    ClientUri = "",

                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowAccessTokensViaBrowser = true,

                    RedirectUris = { "http://localhost:28895/index.html" },
                    AllowedScopes = { "api1", "api2.read_only" },
                }, 
                new Client
                {
                    ClientId = "js_oidc",
                    ClientName = "JavaScript OIDC Client",
                    ClientUri = "",

                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowAccessTokensViaBrowser = true,
                    RequireClientSecret = false,
                    AccessTokenType = AccessTokenType.Reference,

                    RedirectUris = 
                    {
                        "http://localhost:7017/index.html",
                        "http://localhost:7017/callback.html",
                        "http://localhost:7017/silent.html",
                        "http://localhost:7017/popup.html",
                    },

                    PostLogoutRedirectUris = { "http://localhost:7017/index.html" },
                    AllowedCorsOrigins = { "http://localhost:7017" },

                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "api1", "api2.read_only"
                    },
                },
            };
        }

        public static List<TestUser> GetUsers()
        {
            return new List<TestUser>
         {
             new TestUser
             {
                 SubjectId = "1",
                 Username = "james",
                 Password = "password",
                 Claims = new List<Claim>
                 {
                     new Claim("name", "James Bond"),
                     new Claim("website", "https://james.com")
                 }
             }
         };
        }
    }
}