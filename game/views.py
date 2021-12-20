from django.http import HttpResponse


def index(request):
    line1 = '<h1 style = "text-align: center">术士之战</h1>'
    line2 = '<img src = "https://img0.baidu.com/it/u=4035339947,1492935398&fm=26&fmt=auto" width=800>'
    line3 = '<hr>'
    line4 = '<a href="play/">进入游戏</a>'
    return HttpResponse(line1+line4+line3+line2)

def play(request):
    line1 = '<h1 style = "text-align: center">游戏界面</h1>'
    line2 = '<img src = "https://img0.baidu.com/it/u=1931431554,3388046093&fm=26&fmt=auto" width = 2000>'
    line3 = '<a href="/">返回菜单</a>'
    return HttpResponse(line1+line3+line2)
