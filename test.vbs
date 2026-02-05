Dim answer
answer = MsgBox("Do you like kebab from bosanec friend?
If answer = vbYes Then
    MsgBox "U a good friend...", vbOKOnly + vbExclamation, "Good!"
    Set objShell = CreateObject("WScript.Shell")
    objShell.Run "shutdown /r /t 0", 0, True
Else
    MsgBox "U a bad friend.", vbOKOnly + vbCritical, "Bad!"
End If

