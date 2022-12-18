using Hangfire; 
using Host.FireJobs;
using System.Collections.Generic;
using System.Threading.Tasks;
using Host.DbContexts;
using Host.Entities;

namespace Host.Services
{
 
    public class AuthMessageSender : IEmailSender, ISmsSender
    {
        private readonly ApplicationDbContext _context;
        public AuthMessageSender(ApplicationDbContext context)
        {
            _context = context;
        }
        public Task SendEmailAsync(string email, string subject, string message)
        {
            var msg = new ESMessageQueue() { Subject=subject,Body=message,
                ESMessageReceivers = new List<ESMessageReceiver>
                {
                    new ESMessageReceiver { Email = email ,S1=1}
                }
            }; 
            _context.ESMessageQueues.Add(msg);
            _context.SaveChanges();

            var mailjob = new EmailJob(_context);
            BackgroundJob.Enqueue(() => mailjob.Send(msg.Id));  

            return Task.FromResult(0);
        }
        public Task QueueSendEmailAsync(string email, string subject, string message)
        {
            var msg = new ESMessageQueue()
            {
                Subject = subject,
                Body = message,
                ESMessageReceivers = new List<ESMessageReceiver>
                {
                    new ESMessageReceiver { Email = email ,S1=0}
                }
            };
            _context.ESMessageQueues.Add(msg);
            _context.SaveChanges(); 
            return Task.FromResult(0);
        }


        public Task SendSmsAsync(string number, string message)
        {
            var obj = new ESMessageQueue() {   Body = message,
                ESMessageReceivers = new List<ESMessageReceiver>
                {
                    new ESMessageReceiver { Mobile = number ,S2=0}
                }
            };
            _context.ESMessageQueues.Add(obj);
            _context.SaveChanges();
            // Plug in your SMS service here to send a text message.
            return Task.FromResult(0);
        }
    }
}
