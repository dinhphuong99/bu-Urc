// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using IdentityModel;
using IdentityServer4.Configuration;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Logging;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdentityServer4.Validation
{
    /// <summary>
    /// The token request validator
    /// </summary>
    /// <seealso cref="IdentityServer4.Validation.ITokenRequestValidator" />
    public class TokenRequestValidator : ITokenRequestValidator
    {
        private readonly ILogger _logger;
        private readonly IdentityServerOptions _options;
        private readonly IAuthorizationCodeStore _authorizationCodeStore;
        private readonly IRefreshTokenStore _refreshTokenStore;
        private readonly ExtensionGrantValidator _extensionGrantValidator;
        private readonly ICustomTokenRequestValidator _customRequestValidator;
        private readonly ScopeValidator _scopeValidator;
        private readonly IEventService _events;
        private readonly IResourceOwnerPasswordValidator _resourceOwnerValidator;
        private readonly IProfileService _profile;

        private ValidatedTokenRequest _validatedRequest;

        /// <summary>
        /// Initializes a new instance of the <see cref="TokenRequestValidator"/> class.
        /// </summary>
        /// <param name="options">The options.</param>
        /// <param name="authorizationCodeStore">The authorization code store.</param>
        /// <param name="refreshTokenStore">The refresh token store.</param>
        /// <param name="resourceOwnerValidator">The resource owner validator.</param>
        /// <param name="profile">The profile.</param>
        /// <param name="extensionGrantValidator">The extension grant validator.</param>
        /// <param name="customRequestValidator">The custom request validator.</param>
        /// <param name="scopeValidator">The scope validator.</param>
        /// <param name="events">The events.</param>
        /// <param name="logger">The logger.</param>
        public TokenRequestValidator(IdentityServerOptions options, IAuthorizationCodeStore authorizationCodeStore, IRefreshTokenStore refreshTokenStore, IResourceOwnerPasswordValidator resourceOwnerValidator, IProfileService profile, ExtensionGrantValidator extensionGrantValidator, ICustomTokenRequestValidator customRequestValidator, ScopeValidator scopeValidator, IEventService events, ILogger<TokenRequestValidator> logger)
        {
            _logger = logger;
            _options = options;
            _authorizationCodeStore = authorizationCodeStore;
            _refreshTokenStore = refreshTokenStore;
            _resourceOwnerValidator = resourceOwnerValidator;
            _profile = profile;
            _extensionGrantValidator = extensionGrantValidator;
            _customRequestValidator = customRequestValidator;
            _scopeValidator = scopeValidator;
            _events = events;
        }

        /// <summary>
        /// Validates the request.
        /// </summary>
        /// <param name="parameters">The parameters.</param>
        /// <param name="client">The client.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentNullException">
        /// parameters
        /// or
        /// client
        /// </exception>
        public async Task<TokenRequestValidationResult> ValidateRequestAsync(NameValueCollection parameters, Client client)
        {
            _logger.LogDebug("Start token request validation");

            _validatedRequest = new ValidatedTokenRequest
            {
                Raw = parameters ?? throw new ArgumentNullException(nameof(parameters)),
                Options = _options
            };

            _validatedRequest.SetClient(client ?? throw new ArgumentNullException(nameof(client)));

            /////////////////////////////////////////////
            // check client protocol type
            /////////////////////////////////////////////
            if (client.ProtocolType != IdentityServerConstants.ProtocolTypes.OpenIdConnect)
            {
                LogError("Client {clientId} has invalid protocol type for token endpoint: {protocolType}", client.ClientId, client.ProtocolType);
                return Invalid(OidcConstants.TokenErrors.InvalidClient);
            }

            /////////////////////////////////////////////
            // check grant type
            /////////////////////////////////////////////
            var grantType = parameters.Get(OidcConstants.TokenRequest.GrantType);
            if (grantType.IsMissing())
            {
                LogError("Grant type is missing");
                return Invalid(OidcConstants.TokenErrors.UnsupportedGrantType);
            }

            if (grantType.Length > _options.InputLengthRestrictions.GrantType)
            {
                LogError("Grant type is too long");
                return Invalid(OidcConstants.TokenErrors.UnsupportedGrantType);
            }

            _validatedRequest.GrantType = grantType;

            switch (grantType)
            {
                case OidcConstants.GrantTypes.AuthorizationCode:
                    return await RunValidationAsync(ValidateAuthorizationCodeRequestAsync, parameters);
                case OidcConstants.GrantTypes.ClientCredentials:
                    return await RunValidationAsync(ValidateClientCredentialsRequestAsync, parameters);
                case OidcConstants.GrantTypes.Password:
                    return await RunValidationAsync(ValidateResourceOwnerCredentialRequestAsync, parameters);
                case OidcConstants.GrantTypes.RefreshToken:
                    return await RunValidationAsync(ValidateRefreshTokenRequestAsync, parameters);
                default:
                    return await RunValidationAsync(ValidateExtensionGrantRequestAsync, parameters);
            }
        }

        private async Task<TokenRequestValidationResult> RunValidationAsync(Func<NameValueCollection, Task<TokenRequestValidationResult>> validationFunc, NameValueCollection parameters)
        {
            // run standard validation
            var result = await validationFunc(parameters);
            if (result.IsError)
            {
                return result;
            }

            // run custom validation
            _logger.LogTrace("Calling into custom request validator: {type}", _customRequestValidator.GetType().FullName);

            var customValidationContext = new CustomTokenRequestValidationContext { Result = result };
            await _customRequestValidator.ValidateAsync(customValidationContext);

            if (customValidationContext.Result.IsError)
            {
                if (customValidationContext.Result.Error.IsPresent())
                {
                    LogError("Custom token request validator error {error}", customValidationContext.Result.Error);
                }
                else
                {
                    LogError("Custom token request validator error");
                }

                return customValidationContext.Result;
            }

            LogSuccess();
            return customValidationContext.Result;
        }

        private async Task<TokenRequestValidationResult> ValidateAuthorizationCodeRequestAsync(NameValueCollection parameters)
        {
            _logger.LogDebug("Start validation of authorization code token request");

            /////////////////////////////////////////////
            // check if client is authorized for grant type
            /////////////////////////////////////////////
            if (!_validatedRequest.Client.AllowedGrantTypes.ToList().Contains(GrantType.AuthorizationCode) &&
                !_validatedRequest.Client.AllowedGrantTypes.ToList().Contains(GrantType.Hybrid))
            {
                LogError("Client not authorized for code flow");
                return Invalid(OidcConstants.TokenErrors.UnauthorizedClient);
            }

            /////////////////////////////////////////////
            // validate authorization code
            /////////////////////////////////////////////
            var code = parameters.Get(OidcConstants.TokenRequest.Code);
            if (code.IsMissing())
            {
                LogError("Authorization code is missing");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (code.Length > _options.InputLengthRestrictions.AuthorizationCode)
            {
                LogError("Authorization code is too long");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.AuthorizationCodeHandle = code;

            var authZcode = await _authorizationCodeStore.GetAuthorizationCodeAsync(code);
            if (authZcode == null)
            {
                LogError("Invalid authorization code: {code}", code);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            await _authorizationCodeStore.RemoveAuthorizationCodeAsync(code);

            /////////////////////////////////////////////
            // populate session id
            /////////////////////////////////////////////
            if (authZcode.SessionId.IsPresent())
            {
                _validatedRequest.SessionId = authZcode.SessionId;
            }

            /////////////////////////////////////////////
            // validate client binding
            /////////////////////////////////////////////
            if (authZcode.ClientId != _validatedRequest.Client.ClientId)
            {
                LogError("Client {0} is trying to use a code from client {1}", _validatedRequest.Client.ClientId, authZcode.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            /////////////////////////////////////////////
            // validate code expiration
            /////////////////////////////////////////////
            if (authZcode.CreationTime.HasExceeded(_validatedRequest.Client.AuthorizationCodeLifetime))
            {
                LogError("Authorization code is expired");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.AuthorizationCode = authZcode;

            /////////////////////////////////////////////
            // validate redirect_uri
            /////////////////////////////////////////////
            var redirectUri = parameters.Get(OidcConstants.TokenRequest.RedirectUri);
            if (redirectUri.IsMissing())
            {
                LogError("Redirect URI is missing");
                return Invalid(OidcConstants.TokenErrors.UnauthorizedClient);
            }

            if (redirectUri.Equals(_validatedRequest.AuthorizationCode.RedirectUri, StringComparison.Ordinal) == false)
            {
                LogError("Invalid redirect_uri: {redirectUri}", redirectUri);
                return Invalid(OidcConstants.TokenErrors.UnauthorizedClient);
            }

            /////////////////////////////////////////////
            // validate scopes are present
            /////////////////////////////////////////////
            if (_validatedRequest.AuthorizationCode.RequestedScopes == null ||
                !_validatedRequest.AuthorizationCode.RequestedScopes.Any())
            {
                LogError("Authorization code has no associated scopes");
                return Invalid(OidcConstants.TokenErrors.InvalidRequest);
            }

            /////////////////////////////////////////////
            // validate PKCE parameters
            /////////////////////////////////////////////
            var codeVerifier = parameters.Get(OidcConstants.TokenRequest.CodeVerifier);
            if (_validatedRequest.Client.RequirePkce)
            {
                _logger.LogDebug("Client required a proof key for code exchange. Starting PKCE validation");

                var proofKeyResult = ValidateAuthorizationCodeWithProofKeyParameters(codeVerifier, _validatedRequest.AuthorizationCode);
                if (proofKeyResult.IsError)
                {
                    return proofKeyResult;
                }

                _validatedRequest.CodeVerifier = codeVerifier;
            }
            else
            {
                if (codeVerifier.IsPresent())
                {
                    LogError("Unexpected code_verifier: {codeVerifier}. This happens when the client is trying to use PKCE, but it is not enabled. Set RequirePkce to true.", codeVerifier);
                    return Invalid(OidcConstants.TokenErrors.InvalidGrant);
                }
            }
        
            /////////////////////////////////////////////
            // make sure user is enabled
            /////////////////////////////////////////////
            var isActiveCtx = new IsActiveContext(_validatedRequest.AuthorizationCode.Subject, _validatedRequest.Client, IdentityServerConstants.ProfileIsActiveCallers.AuthorizationCodeValidation);
            await _profile.IsActiveAsync(isActiveCtx);

            if (isActiveCtx.IsActive == false)
            {
                LogError("User has been disabled: {subjectId}", _validatedRequest.AuthorizationCode.Subject.GetSubjectId());
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _logger.LogDebug("Validation of authorization code token request success");

            return Valid();
        }

        private async Task<TokenRequestValidationResult> ValidateClientCredentialsRequestAsync(NameValueCollection parameters)
        {
            _logger.LogDebug("Start client credentials token request validation");

            /////////////////////////////////////////////
            // check if client is authorized for grant type
            /////////////////////////////////////////////
            if (!_validatedRequest.Client.AllowedGrantTypes.ToList().Contains(GrantType.ClientCredentials))
            {
                LogError("{clientId} not authorized for client credentials flow", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.UnauthorizedClient);
            }

            /////////////////////////////////////////////
            // check if client is allowed to request scopes
            /////////////////////////////////////////////
            if (!(await ValidateRequestedScopesAsync(parameters)))
            {
                return Invalid(OidcConstants.TokenErrors.InvalidScope);
            }

            if (_validatedRequest.ValidatedScopes.ContainsOpenIdScopes)
            {
                LogError("{clientId} cannot request OpenID scopes in client credentials flow", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidScope);
            }

            if (_validatedRequest.ValidatedScopes.ContainsOfflineAccessScope)
            {
                LogError("{clientId} cannot request a refresh token in client credentials flow", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidScope);
            }

            _logger.LogDebug("{clientId} credentials token request validation success", _validatedRequest.Client.ClientId);
            return Valid();
        }

        private async Task<TokenRequestValidationResult> ValidateResourceOwnerCredentialRequestAsync(NameValueCollection parameters)
        {
            _logger.LogDebug("Start resource owner password token request validation");

            /////////////////////////////////////////////
            // check if client is authorized for grant type
            /////////////////////////////////////////////
            if (!_validatedRequest.Client.AllowedGrantTypes.Contains(GrantType.ResourceOwnerPassword))
            {
                LogError("{clientId} not authorized for resource owner flow", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.UnauthorizedClient);
            }

            /////////////////////////////////////////////
            // check if client is allowed to request scopes
            /////////////////////////////////////////////
            if (!(await ValidateRequestedScopesAsync(parameters)))
            {
                return Invalid(OidcConstants.TokenErrors.InvalidScope);
            }

            /////////////////////////////////////////////
            // check resource owner credentials
            /////////////////////////////////////////////
            var userName = parameters.Get(OidcConstants.TokenRequest.UserName);
            var password = parameters.Get(OidcConstants.TokenRequest.Password);

            if (userName.IsMissing() || password.IsMissing())
            {
                LogError("Username or password missing");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (userName.Length > _options.InputLengthRestrictions.UserName ||
                password.Length > _options.InputLengthRestrictions.Password)
            {
                LogError("Username or password too long");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.UserName = userName;


            /////////////////////////////////////////////
            // authenticate user
            /////////////////////////////////////////////
            var resourceOwnerContext = new ResourceOwnerPasswordValidationContext
            {
                UserName = userName,
                Password = password,
                Request = _validatedRequest
            };
            await _resourceOwnerValidator.ValidateAsync(resourceOwnerContext);

            if (resourceOwnerContext.Result.IsError)
            {
                if (resourceOwnerContext.Result.Error == OidcConstants.TokenErrors.UnsupportedGrantType)
                {
                    LogError("Resource owner password credential grant type not supported");
                    await RaiseFailedResourceOwnerAuthenticationEventAsync(userName, "password grant type not supported");

                    return Invalid(OidcConstants.TokenErrors.UnsupportedGrantType, customResponse: resourceOwnerContext.Result.CustomResponse);
                }

                var errorDescription = "invalid_username_or_password";

                if (resourceOwnerContext.Result.ErrorDescription.IsPresent())
                {
                    errorDescription = resourceOwnerContext.Result.ErrorDescription;
                }
               
                LogError("User authentication failed: {error}", errorDescription ?? resourceOwnerContext.Result.Error);
                await RaiseFailedResourceOwnerAuthenticationEventAsync(userName, errorDescription);

                return Invalid(OidcConstants.TokenErrors.InvalidGrant, errorDescription, resourceOwnerContext.Result.CustomResponse);
            }

            if (resourceOwnerContext.Result.Subject == null)
            {
                var error = "User authentication failed: no principal returned";
                LogError(error);
                await RaiseFailedResourceOwnerAuthenticationEventAsync(userName, error);

                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            /////////////////////////////////////////////
            // make sure user is enabled
            /////////////////////////////////////////////
            var isActiveCtx = new IsActiveContext(resourceOwnerContext.Result.Subject, _validatedRequest.Client, IdentityServerConstants.ProfileIsActiveCallers.ResourceOwnerValidation);
            await _profile.IsActiveAsync(isActiveCtx);

            if (isActiveCtx.IsActive == false)
            {
                LogError("User has been disabled: {subjectId}", resourceOwnerContext.Result.Subject.GetSubjectId());
                await RaiseFailedResourceOwnerAuthenticationEventAsync(userName, "user is inactive");

                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.UserName = userName;
            _validatedRequest.Subject = resourceOwnerContext.Result.Subject;

            await RaiseSuccessfulResourceOwnerAuthenticationEventAsync(userName, resourceOwnerContext.Result.Subject.GetSubjectId());
            _logger.LogDebug("Resource owner password token request validation success.");
            return Valid(resourceOwnerContext.Result.CustomResponse);
        }

        private async Task<TokenRequestValidationResult> ValidateRefreshTokenRequestAsync(NameValueCollection parameters)
        {
            _logger.LogDebug("Start validation of refresh token request");

            var refreshTokenHandle = parameters.Get(OidcConstants.TokenRequest.RefreshToken);
            if (refreshTokenHandle.IsMissing())
            {
                LogError("Refresh token is missing");
                return Invalid(OidcConstants.TokenErrors.InvalidRequest);
            }

            if (refreshTokenHandle.Length > _options.InputLengthRestrictions.RefreshToken)
            {
                LogError("Refresh token too long");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.RefreshTokenHandle = refreshTokenHandle;

            /////////////////////////////////////////////
            // check if refresh token is valid
            /////////////////////////////////////////////
            var refreshToken = await _refreshTokenStore.GetRefreshTokenAsync(refreshTokenHandle);
            if (refreshToken == null)
            {
                LogError("Invalid refresh token: {refreshToken}", refreshTokenHandle);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            /////////////////////////////////////////////
            // check if refresh token has expired
            /////////////////////////////////////////////
            if (refreshToken.CreationTime.HasExceeded(refreshToken.Lifetime))
            {
                LogError("Refresh token has expired");

                await _refreshTokenStore.RemoveRefreshTokenAsync(refreshTokenHandle);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            /////////////////////////////////////////////
            // check if client belongs to requested refresh token
            /////////////////////////////////////////////
            if (_validatedRequest.Client.ClientId != refreshToken.ClientId)
            {
                LogError("{0} tries to refresh token belonging to {1}", _validatedRequest.Client.ClientId, refreshToken.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            /////////////////////////////////////////////
            // check if client still has offline_access scope
            /////////////////////////////////////////////
            if (!_validatedRequest.Client.AllowOfflineAccess)
            {
                LogError("{clientId} does not have access to offline_access scope anymore", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.RefreshToken = refreshToken;

            /////////////////////////////////////////////
            // make sure user is enabled
            /////////////////////////////////////////////
            var subject = _validatedRequest.RefreshToken.Subject;
            var isActiveCtx = new IsActiveContext(subject, _validatedRequest.Client, IdentityServerConstants.ProfileIsActiveCallers.RefreshTokenValidation);
            await _profile.IsActiveAsync(isActiveCtx);

            if (isActiveCtx.IsActive == false)
            {
                LogError("{subjectId} has been disabled", _validatedRequest.RefreshToken.SubjectId);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            _validatedRequest.Subject = subject;

            _logger.LogDebug("Validation of refresh token request success");
            return Valid();
        }

        private async Task<TokenRequestValidationResult> ValidateExtensionGrantRequestAsync(NameValueCollection parameters)
        {
            _logger.LogDebug("Start validation of custom grant token request");

            /////////////////////////////////////////////
            // check if client is allowed to use grant type
            /////////////////////////////////////////////
            if (!_validatedRequest.Client.AllowedGrantTypes.Contains(_validatedRequest.GrantType))
            {
                LogError("{clientId} does not have the custom grant type in the allowed list, therefore requested grant is not allowed", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.UnsupportedGrantType);
            }

            /////////////////////////////////////////////
            // check if a validator is registered for the grant type
            /////////////////////////////////////////////
            if (!_extensionGrantValidator.GetAvailableGrantTypes().Contains(_validatedRequest.GrantType, StringComparer.Ordinal))
            {
                LogError("No validator is registered for the grant type: {grantType}", _validatedRequest.GrantType);
                return Invalid(OidcConstants.TokenErrors.UnsupportedGrantType);
            }

            /////////////////////////////////////////////
            // check if client is allowed to request scopes
            /////////////////////////////////////////////
            if (!(await ValidateRequestedScopesAsync(parameters)))
            {
                return Invalid(OidcConstants.TokenErrors.InvalidScope);
            }

            /////////////////////////////////////////////
            // validate custom grant type
            /////////////////////////////////////////////
            var result = await _extensionGrantValidator.ValidateAsync(_validatedRequest);

            if (result == null)
            {
                LogError("Invalid extension grant");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (result.IsError)
            {
                if (result.Error.IsPresent())
                {
                    LogError("Invalid extension grant: {error}", result.Error);
                    return Invalid(result.Error, result.ErrorDescription, result.CustomResponse);
                }
                else
                {
                    LogError("Invalid extension grant");
                    return Invalid(OidcConstants.TokenErrors.InvalidGrant, customResponse: result.CustomResponse);
                }
            }

            if (result.Subject != null)
            {
                _validatedRequest.Subject = result.Subject;
            }

            _logger.LogDebug("Validation of extension grant token request success");
            return Valid(result.CustomResponse);
        }

        private async Task<bool> ValidateRequestedScopesAsync(NameValueCollection parameters)
        {
            var scopes = parameters.Get(OidcConstants.TokenRequest.Scope);

            if (scopes.IsMissing())
            {
                _logger.LogTrace("Client provided no scopes - checking allowed scopes list");
                
                if (!_validatedRequest.Client.AllowedScopes.IsNullOrEmpty())
                {
                    var clientAllowedScopes = new List<string>(_validatedRequest.Client.AllowedScopes);
                    if (_validatedRequest.Client.AllowOfflineAccess)
                    {
                        clientAllowedScopes.Add(IdentityServerConstants.StandardScopes.OfflineAccess);
                    }
                    scopes = clientAllowedScopes.ToSpaceSeparatedString();
                    _logger.LogTrace("Defaulting to: {scopes}", scopes);
                }
                else
                {
                    LogError("No allowed scopes configured for {clientId}", _validatedRequest.Client.ClientId);
                    return false;
                }
            }

            if (scopes.Length > _options.InputLengthRestrictions.Scope)
            {
                LogError("Scope parameter exceeds max allowed length");
                return false;
            }

            var requestedScopes = scopes.ParseScopesString();

            if (requestedScopes == null)
            {
                LogError("No scopes found in request");
                return false;
            }

            if (!(await _scopeValidator.AreScopesAllowedAsync(_validatedRequest.Client, requestedScopes)))
            {
                LogError();
                return false;
            }

            if (!(await _scopeValidator.AreScopesValidAsync(requestedScopes)))
            {
                LogError();
                return false;
            }

            _validatedRequest.Scopes = requestedScopes;
            _validatedRequest.ValidatedScopes = _scopeValidator;
            return true;
        }

        private TokenRequestValidationResult ValidateAuthorizationCodeWithProofKeyParameters(string codeVerifier, AuthorizationCode authZcode)
        {
            if (authZcode.CodeChallenge.IsMissing() || authZcode.CodeChallengeMethod.IsMissing())
            {
                LogError("{clientId} is missing code challenge or code challenge method", _validatedRequest.Client.ClientId);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (codeVerifier.IsMissing())
            {
                LogError("Missing code_verifier");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (codeVerifier.Length < _options.InputLengthRestrictions.CodeVerifierMinLength ||
                codeVerifier.Length > _options.InputLengthRestrictions.CodeVerifierMaxLength)
            {
                LogError("code_verifier is too short or too long");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (Constants.SupportedCodeChallengeMethods.Contains(authZcode.CodeChallengeMethod) == false)
            {
                LogError("Unsupported code challenge method: {codeChallengeMethod}", authZcode.CodeChallengeMethod);
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            if (ValidateCodeVerifierAgainstCodeChallenge(codeVerifier, authZcode.CodeChallenge, authZcode.CodeChallengeMethod) == false)
            {
                LogError("Transformed code verifier does not match code challenge");
                return Invalid(OidcConstants.TokenErrors.InvalidGrant);
            }

            return Valid();
        }

        private bool ValidateCodeVerifierAgainstCodeChallenge(string codeVerifier, string codeChallenge, string codeChallengeMethod)
        {
            if (codeChallengeMethod == OidcConstants.CodeChallengeMethods.Plain)
            {
                return TimeConstantComparer.IsEqual(codeVerifier.Sha256(), codeChallenge);
            }

            var codeVerifierBytes = Encoding.ASCII.GetBytes(codeVerifier);
            var hashedBytes = codeVerifierBytes.Sha256();
            var transformedCodeVerifier = Base64Url.Encode(hashedBytes);

            return TimeConstantComparer.IsEqual(transformedCodeVerifier.Sha256(), codeChallenge);
        }

        private TokenRequestValidationResult Valid(Dictionary<string, object> customResponse = null)
        {
            return new TokenRequestValidationResult(_validatedRequest, customResponse);
        }

        private TokenRequestValidationResult Invalid(string error, string errorDescription = null, Dictionary<string, object> customResponse = null)
        {
            return new TokenRequestValidationResult(_validatedRequest, error, errorDescription, customResponse);
        }

        private void LogError(string message = null, params object[] values)
        {
            if (message.IsPresent())
            {
                try
                {
                    _logger.LogError(message, values);
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error logging {exception}", ex.Message);
                }
            }

            var details = new TokenRequestValidationLog(_validatedRequest);
            _logger.LogError("{details}", details);
        }

        private void LogSuccess()
        {
            var details = new TokenRequestValidationLog(_validatedRequest);
            _logger.LogInformation("Token request validation success\n{details}", details);
        }

        private Task RaiseSuccessfulResourceOwnerAuthenticationEventAsync(string userName, string subjectId)
        {
            return _events.RaiseAsync(new UserLoginSuccessEvent(userName, subjectId, null, false));
        }

        private Task RaiseFailedResourceOwnerAuthenticationEventAsync(string userName, string error)
        {
            return _events.RaiseAsync(new UserLoginFailureEvent(userName, error));
        }
    }
}