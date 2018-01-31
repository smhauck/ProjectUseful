# Copyright (C) 2018 William B. Hauck, http://www.wbhauck.com
# 
# This file is part of Project Useful.
# 
# Project Useful is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Project Useful is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with Project Useful.  If not, see <http://www.gnu.org/licenses/>.


class SessionsController < ApplicationController

  skip_before_action :authorize

  def create
    user = User.find_by(username: params[:username])
    if user and user.authenticate(params[:password])
      session[:user_id] = user.id
      if session[:original_target]
        redirect_to session[:original_target]
      else
        redirect_to root_url
      end
    else
      redirect_to login_url, alert: "Invalid user / password combination"
    end
  end


  def destroy
    session[:user_id] = nil
    session[:original_target] = nil
    redirect_to root_url, notice: "Logged Out"
  end

  def new
  end

end
