### 💰 Estimated Monthly Costs

> **Note:** These are rough estimates. Actual costs depend on usage patterns.

| Resource | Estimated Cost |
|----------|----------------|
| Lambda Function | $0-5 (depends on invocations) |
| API Gateway | $0-10 (depends on requests) |
| ECR Repository | $0-1 (storage) |
| CloudWatch Logs | $0-2 (log retention) |
| S3 Frontend Bucket | $0-1 (storage + requests) |
| CloudFront Distribution | $0-5 (data transfer) |
| Route53 DNS | $0.50 (hosted zone) |

**Total Estimated Range:** $0.50-24.50/month

💡 **Cost Optimization Tips:**
- Lambda costs are based on execution time and memory
- API Gateway charges per request ($3.50 per million requests)
- ECR storage is $0.10 per GB per month
- Consider setting up CloudWatch cost alerts
- Use CloudFront caching to reduce origin requests
- Monitor S3 storage classes for cost optimization

### Usage Assumptions
- **Lambda**: 100,000 requests/month, 512MB memory, 3s duration
- **API Gateway**: 100,000 requests/month
- **CloudFront**: 1GB data transfer/month
- **ECR**: 1GB container image storage
- **CloudWatch**: 14-day log retention