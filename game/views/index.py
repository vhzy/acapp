#返回刚刚的HTML文件
from django.shortcuts import render

def index(request):
    return render(request,"multiends/web.html")
