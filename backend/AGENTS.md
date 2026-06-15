# Backend Test Commands

```powershell
cd backend
npm test                  # Full suite (55 tests, sequential)
npm test -- --testPathPattern='auth'           # auth only
npm test -- --testPathPattern='event'          # event only
npm test -- --testPathPattern='notification'   # notification only
npm test -- --testPathPattern='integration'    # integration only
```

**Note:** Uses `--runInBand` by default — tests share MongoMemoryServer and must run sequentially.
