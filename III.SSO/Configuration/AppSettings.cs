namespace Host.Configuration
{
    public class AppSettings
    {
        public string Authority { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Api { get; set; }
        public ADConfigs ADConfigs { get; set; }
    }

    public class ADConfigs
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string LoginDN { get; set; }
        public string Password { get; set; }
        public string ObjectDN { get; set; }
    }
}