def migrate(request):
    call_command('migrate')
    return JsonResponse({'status': 'migrations complete'})

def collectstatic(request):
    call_command('collectstatic', '--noinput')
    return JsonResponse({'status': 'static files collected'})