using System.Linq;
using Host.DbContexts;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace Host.FireJobs
{
    public class EmailJob
    {
        private readonly ApplicationDbContext _context;
        public EmailJob(ApplicationDbContext context)
        {
            _context = context;
        }
     
        public void Send(int id)
        {
           
            var sender = _context.ESEmailConfigs.Where(x => x.Code.Equals("INFO")).First(); 
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(sender.Title, sender.Email));
            var data = _context.ESMessageQueues.Include(blog => blog.ESMessageReceivers).Single(x => x.Id == id);
            foreach(var to in data.ESMessageReceivers)
            {
                if(!string.IsNullOrEmpty(to.Email)) message.To.Add(new MailboxAddress(to.Email));
            } 
            message.Subject = data.Subject; 
            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = data.Body; 
            var doc = new HtmlAgilityPack.HtmlDocument();
            doc.LoadHtml(@"<html><body>" + data.Body + "</body></html>");  
            bodyBuilder.TextBody = doc.DocumentNode.SelectSingleNode("//body").InnerText; 
            message.Body = bodyBuilder.ToMessageBody();  
            using (var client = new SmtpClient())
            { 
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                if (sender.Smtpssl.HasValue) client.Connect(sender.Smtp, sender.Smtpport.Value, sender.Smtpssl.Value);
                else
                    client.Connect(sender.Smtp, sender.Smtpport.Value, SecureSocketOptions.Auto); 
                client.AuthenticationMechanisms.Remove("XOAUTH2");
                var key = "123"; 
                client.Authenticate(sender.Email, EasyCrypto.AesEncryption.DecryptWithPassword(sender.Password ?? "", key)); 
                client.Send(message);
                client.Disconnect(true);
            }
        }
    }
}
